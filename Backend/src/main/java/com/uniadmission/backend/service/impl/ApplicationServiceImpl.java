package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.dto.response.statistics.ApplicationStatisticsGroupResponse;
import com.uniadmission.backend.dto.response.statistics.ApplicationStatisticsResponse;
import com.uniadmission.backend.entity.AdmissionRound;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.Candidate;
import com.uniadmission.backend.entity.Major;
import com.uniadmission.backend.entity.SubjectGroup;
import com.uniadmission.backend.entity.ApplicationReviewLog;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.repository.AdmissionRoundRepository;
import com.uniadmission.backend.repository.ApplicationRepository;
import com.uniadmission.backend.repository.ApplicationReviewLogRepository;
import com.uniadmission.backend.repository.CandidateRepository;
import com.uniadmission.backend.repository.MajorRepository;
import com.uniadmission.backend.repository.SubjectGroupRepository;
import com.uniadmission.backend.service.ApplicationService;
import com.uniadmission.backend.service.EmailService;
import com.uniadmission.backend.service.NotificationLogService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

        private static final org.slf4j.Logger LOGGER = org.slf4j.LoggerFactory.getLogger(ApplicationServiceImpl.class);

        private final ApplicationRepository applicationRepository;
        private final EmailService emailService;
        private final ApplicationReviewLogRepository reviewLogRepository;
        private final NotificationLogService notificationService;
        private final CandidateRepository candidateRepository;
        private final MajorRepository majorRepository;
        private final AdmissionRoundRepository admissionRoundRepository;
        private final SubjectGroupRepository subjectGroupRepository;

        private Application applyRequest(Application application, ApplicationSubmitRequest request,
                        boolean requireMajorAndSubjectGroup) {
                if (request.getCandidateId() == null) {
                        throw new RuntimeException("Candidate not found");
                }

                Candidate candidate = candidateRepository
                                .findById(java.util.Objects.requireNonNull(request.getCandidateId()))
                                .orElseThrow(() -> new RuntimeException(
                                                "Candidate not found: " + request.getCandidateId()));
                application.setCandidate(candidate);

                if (request.getMajorId() != null) {
                        Major major = majorRepository.findById(java.util.Objects.requireNonNull(request.getMajorId()))
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Major not found: " + request.getMajorId()));
                        application.setMajor(major);
                } else if (requireMajorAndSubjectGroup) {
                        throw new RuntimeException("Major not found");
                }

                if (request.getAdmissionRoundId() != null) {
                        AdmissionRound admissionRound = admissionRoundRepository
                                        .findById(java.util.Objects.requireNonNull(request.getAdmissionRoundId()))
                                        .orElseThrow(() -> new RuntimeException("Admission round not found: "
                                                        + request.getAdmissionRoundId()));
                        application.setAdmissionRound(admissionRound);
                }

                if (request.getSubjectGroupId() != null) {
                        SubjectGroup subjectGroup = subjectGroupRepository
                                        .findById(java.util.Objects.requireNonNull(request.getSubjectGroupId()))
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Subject group not found: " + request.getSubjectGroupId()));
                        application.setSubjectGroup(subjectGroup);
                } else if (requireMajorAndSubjectGroup) {
                        throw new RuntimeException("Subject group not found");
                }

                application.setTotalScore(request.getTotalScore());
                application.setPriorityGroup(request.getPriorityGroup());
                application.setPriorityScore(request.getPriorityScore());
                try {
                        LOGGER.info("Persisting scores for application request: {}", request.getScores());
                        if (request.getScores() != null) {
                                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                                String json = mapper.writeValueAsString(request.getScores());
                                application.setScores(json);
                        }
                } catch (Exception e) {
                        LOGGER.warn("Failed to serialize scores", e);
                }

                return application;
        }

        private Application saveWithApplicationCode(Application application) {
                Application saved = applicationRepository.save(application);
                if (saved.getApplicationCode() == null || saved.getApplicationCode().isEmpty()) {
                        String code = "HS" + java.time.LocalDate.now().getYear()
                                        + String.format("%04d", Math.abs(saved.getId().intValue()) % 10000);
                        saved.setApplicationCode(code);
                        saved = applicationRepository.save(saved);
                }
                return saved;
        }

        private void sendSubmissionNotifications(Application saved) {
                String applicationCode = saved.getApplicationCode() != null ? saved.getApplicationCode()
                                : "Chưa cập nhật";

                try {
                        Candidate candidate = saved.getCandidate();
                        Major major = saved.getMajor();
                        String candidateName = candidate != null && candidate.getUser() != null
                                        ? candidate.getUser().getFullName()
                                        : "thí sinh";
                        String email = candidate != null && candidate.getUser() != null
                                        ? candidate.getUser().getEmail()
                                        : null;
                        String universityName = major != null && major.getUniversity() != null
                                        ? major.getUniversity().getName()
                                        : "";
                        String majorName = major != null && major.getName() != null ? major.getName() : "";

                        if (email != null && !email.trim().isEmpty()) {
                                emailService.sendApplicationSubmittedEmail(
                                                email,
                                                candidateName,
                                                applicationCode,
                                                universityName,
                                                majorName);
                        }
                        try {
                                if (candidate != null && candidate.getUser() != null
                                                && candidate.getUser().getId() != null) {
                                        String title = "Xác nhận: hồ sơ đã được tiếp nhận";
                                        String message = "Hồ sơ của bạn (Mã: " + applicationCode
                                                        + ") đã được tiếp nhận. Trường: "
                                                        + universityName + ", Ngành: " + majorName
                                                        + ". Phòng Tuyển Sinh sẽ kiểm tra hồ sơ trong vòng 3-5 ngày làm việc.";
                                        notificationService.createNotification(candidate.getUser().getId(), title,
                                                        message);
                                }
                        } catch (Exception e) {
                                LOGGER.warn("Failed to create in-app notification for application id={}: {}",
                                                saved.getId(), e.getMessage());
                        }
                } catch (Exception e) {
                        LOGGER.warn("Failed to send application submitted email for application id={}: {}",
                                        saved.getId(), e.getMessage());
                }
        }

        @Override
        public Application submit(ApplicationSubmitRequest request) {
                Application application = applyRequest(new Application(), request, true);
                application.setSubmissionDate(java.time.LocalDateTime.now());
                application.setStatus(ApplicationStatus.PENDING);
                Application saved = saveWithApplicationCode(application);
                sendSubmissionNotifications(saved);
                return saved;
        }

        @Override
        public Application saveDraft(ApplicationSubmitRequest request) {
                Application application = applyRequest(new Application(), request, false);
                application.setSubmissionDate(java.time.LocalDateTime.now());
                application.setStatus(ApplicationStatus.DRAFT);
                return saveWithApplicationCode(application);
        }

        @Override
        public Application updateDraft(Long id, ApplicationSubmitRequest request) {
                Application application = applicationRepository.findById(java.util.Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("Application not found"));
                application = applyRequest(application, request, false);
                application.setSubmissionDate(java.time.LocalDateTime.now());
                application.setStatus(ApplicationStatus.DRAFT);
                return saveWithApplicationCode(application);
        }

        @Override
        public Application submitDraft(Long id, ApplicationSubmitRequest request) {
                Application application = applicationRepository.findById(java.util.Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("Application not found"));
                application = applyRequest(application, request, true);
                application.setSubmissionDate(java.time.LocalDateTime.now());
                application.setStatus(ApplicationStatus.PENDING);
                Application saved = saveWithApplicationCode(application);
                sendSubmissionNotifications(saved);
                return saved;
        }

        @Override
        public List<Application> getApplicationsByCandidate(Long candidateId) {
                return applicationRepository.findByCandidate_Id(candidateId);
        }

        @Override
        public void cancelApplication(Long applicationId) {
                Application application = applicationRepository
                                .findById(java.util.Objects.requireNonNull(applicationId))
                                .orElseThrow(() -> new RuntimeException("Application not found"));
                application.setStatus(ApplicationStatus.CANCELLED);
                applicationRepository.save(application);
        }

        @Override
        public List<Application> getAllApplications() {
                return applicationRepository.findAll();
        }

        @Override
        public void updateApplicationStatus(Long id, ApplicationStatus status, String notes, Long adminId) {
                Application application = applicationRepository.findById(java.util.Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("Application not found"));

                applyStatusUpdate(application, status, notes, adminId);
        }

        @Override
        @Transactional
        public void bulkUpdateApplicationStatus(List<Long> ids, ApplicationStatus status, String notes, Long adminId) {
                if (ids == null || ids.isEmpty()) {
                        throw new RuntimeException("Danh sách hồ sơ không được rỗng");
                }

                List<Application> applications = applicationRepository.findAllById(ids);
                if (applications.isEmpty()) {
                        throw new RuntimeException("Không tìm thấy hồ sơ hợp lệ để cập nhật");
                }

                for (Application application : applications) {
                        applyStatusUpdate(application, status, notes, adminId);
                }
        }

        @Override
        @Transactional(readOnly = true)
        public String exportApplicationsCsv(ApplicationStatus status, Long universityId, Long majorId,
                        Long admissionRoundId) {
                List<Application> applications = getApplicationsForExport(status, universityId, majorId,
                                admissionRoundId);

                StringBuilder csv = new StringBuilder();
                csv.append("ID,Mã hồ sơ,Thí sinh,Trường,Ngành,Đợt xét tuyển,Tổ hợp,Tổng điểm,Trạng thái,Ngày nộp\n");

                for (Application application : applications) {
                        String candidateName = application.getCandidate() != null
                                        && application.getCandidate().getUser() != null
                                                        ? application.getCandidate().getUser().getFullName()
                                                        : "";
                        String universityName = application.getMajor() != null
                                        && application.getMajor().getUniversity() != null
                                                        ? application.getMajor().getUniversity().getName()
                                                        : "";
                        String majorName = application.getMajor() != null ? application.getMajor().getName() : "";
                        String roundName = application.getAdmissionRound() != null
                                        ? application.getAdmissionRound().getName()
                                        : "";
                        String subjectGroupCode = application.getSubjectGroup() != null
                                        ? application.getSubjectGroup().getCode()
                                        : "";
                        String totalScore = application.getTotalScore() != null ? application.getTotalScore().toString()
                                        : "";
                        String submittedAt = application.getSubmissionDate() != null
                                        ? application.getSubmissionDate().toString()
                                        : "";

                        csv.append(csvValue(application.getId())).append(',')
                                        .append(csvValue(application.getApplicationCode())).append(',')
                                        .append(csvValue(candidateName)).append(',')
                                        .append(csvValue(universityName)).append(',')
                                        .append(csvValue(majorName)).append(',')
                                        .append(csvValue(roundName)).append(',')
                                        .append(csvValue(subjectGroupCode)).append(',')
                                        .append(csvValue(totalScore)).append(',')
                                        .append(csvValue(
                                                        application.getStatus() != null ? application.getStatus().name()
                                                                        : ""))
                                        .append(',')
                                        .append(csvValue(submittedAt))
                                        .append('\n');
                }

                return csv.toString();
        }

        @Override
        @Transactional(readOnly = true)
        public List<Application> getApplicationsForExport(ApplicationStatus status, Long universityId, Long majorId,
                        Long admissionRoundId) {
                Specification<Application> specification = buildAdminApplicationSpecification(status, universityId,
                                majorId, admissionRoundId);
                return applicationRepository.findAll(specification, Sort.by("id").descending());
        }

        @Override
        @Transactional(readOnly = true)
        public byte[] exportApplicationsXlsx(ApplicationStatus status, Long universityId, Long majorId,
                        Long admissionRoundId) {
                List<Application> applications = getApplicationsForExport(status, universityId, majorId,
                                admissionRoundId);

                try (XSSFWorkbook workbook = new XSSFWorkbook();
                                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                        Sheet sheet = workbook.createSheet("Applications");

                        Row header = sheet.createRow(0);
                        String[] headers = new String[] { "ID", "Mã hồ sơ", "Thí sinh", "Trường", "Ngành",
                                        "Đợt xét tuyển", "Tổ hợp", "Tổng điểm", "Trạng thái", "Ngày nộp" };
                        for (int i = 0; i < headers.length; i++) {
                                header.createCell(i).setCellValue(headers[i]);
                        }

                        for (int i = 0; i < applications.size(); i++) {
                                Application application = applications.get(i);
                                Row row = sheet.createRow(i + 1);
                                row.createCell(0).setCellValue(application.getId() != null ? application.getId() : 0L);
                                row.createCell(1).setCellValue(application.getApplicationCode() != null
                                                ? application.getApplicationCode()
                                                : "");
                                row.createCell(2).setCellValue(application.getCandidate() != null
                                                && application.getCandidate().getUser() != null
                                                                ? application.getCandidate().getUser().getFullName()
                                                                : "");
                                row.createCell(3).setCellValue(application.getMajor() != null
                                                && application.getMajor().getUniversity() != null
                                                                ? application.getMajor().getUniversity().getName()
                                                                : "");
                                row.createCell(4).setCellValue(application.getMajor() != null
                                                ? application.getMajor().getName()
                                                : "");
                                row.createCell(5).setCellValue(application.getAdmissionRound() != null
                                                ? application.getAdmissionRound().getName()
                                                : "");
                                row.createCell(6).setCellValue(application.getSubjectGroup() != null
                                                ? application.getSubjectGroup().getCode()
                                                : "");
                                row.createCell(7).setCellValue(application.getTotalScore() != null
                                                ? application.getTotalScore()
                                                : 0D);
                                row.createCell(8).setCellValue(application.getStatus() != null
                                                ? application.getStatus().name()
                                                : "");
                                row.createCell(9).setCellValue(application.getSubmissionDate() != null
                                                ? application.getSubmissionDate().toString()
                                                : "");
                        }

                        for (int i = 0; i < headers.length; i++) {
                                sheet.autoSizeColumn(i);
                        }

                        workbook.write(outputStream);
                        return outputStream.toByteArray();
                } catch (Exception e) {
                        throw new RuntimeException("Không thể xuất file Excel", e);
                }
        }

        @Override
        public void updateApplicationPriority(Long id, String priorityGroup, Double priorityScore, Long adminId) {
                Application application = applicationRepository.findById(java.util.Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("Application not found"));

                application.setPriorityGroup(priorityGroup);
                application.setPriorityScore(priorityScore);
                applicationRepository.save(application);

                ApplicationReviewLog log = new ApplicationReviewLog();
                log.setApplicationId(application.getId());
                log.setAdminId(adminId != null ? adminId : 1L);
                log.setOldStatus(application.getStatus() != null ? application.getStatus().name() : "");
                log.setNewStatus(application.getStatus() != null ? application.getStatus().name() : "");
                log.setNotes("Cập nhật điểm ưu tiên: group=" + priorityGroup + ", score=" + priorityScore);
                reviewLogRepository.save(log);
        }

        @Override
        public Application updateApplication(Long id,
                        com.uniadmission.backend.dto.request.ApplicationSubmitRequest request) {
                Application application = applicationRepository.findById(java.util.Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("Application not found"));

                if (request.getMajorId() != null) {
                        Major major = majorRepository.findById(java.util.Objects.requireNonNull(request.getMajorId()))
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Major not found: " + request.getMajorId()));
                        application.setMajor(major);
                }

                if (request.getAdmissionRoundId() != null) {
                        AdmissionRound admissionRound = admissionRoundRepository
                                        .findById(java.util.Objects.requireNonNull(request.getAdmissionRoundId()))
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Admission round not found: " + request.getAdmissionRoundId()));
                        application.setAdmissionRound(admissionRound);
                }

                if (request.getSubjectGroupId() != null) {
                        SubjectGroup subjectGroup = subjectGroupRepository
                                        .findById(java.util.Objects.requireNonNull(request.getSubjectGroupId()))
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Subject group not found: " + request.getSubjectGroupId()));
                        application.setSubjectGroup(subjectGroup);
                }

                application.setTotalScore(request.getTotalScore());
                application.setPriorityGroup(request.getPriorityGroup());
                application.setPriorityScore(request.getPriorityScore());
                try {
                        LOGGER.info("Updating scores for application id={}: {}", id, request.getScores());
                        if (request.getScores() != null) {
                                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                                String json = mapper.writeValueAsString(request.getScores());
                                application.setScores(json);
                        }
                } catch (Exception e) {
                        LOGGER.warn("Failed to serialize scores on update", e);
                }
                applicationRepository.save(application);
                return application;
        }

        @Override
        public void deleteApplication(Long id) {
                Application application = applicationRepository.findById(java.util.Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("Application not found"));
                applicationRepository.delete(java.util.Objects.requireNonNull(application));
        }

        @Override
        public Page<Application> getApplicationsForAdmin(ApplicationStatus status, Long universityId, Long majorId,
                        Long admissionRoundId, int page, int size) {
                Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
                Specification<Application> specification = buildAdminApplicationSpecification(status, universityId,
                                majorId, admissionRoundId);

                return applicationRepository.findAll(specification, pageable);
        }

        @Override
        @Transactional(readOnly = true)
        public ApplicationStatisticsResponse getApplicationStatistics(Long universityId, Long majorId,
                        Long admissionRoundId) {
                Specification<Application> specification = buildAdminApplicationSpecification(null, universityId,
                                majorId, admissionRoundId);
                List<Application> applications = applicationRepository.findAll(specification);

                Map<ApplicationStatus, Long> statusTotals = new EnumMap<>(ApplicationStatus.class);
                for (ApplicationStatus status : ApplicationStatus.values()) {
                        statusTotals.put(status, 0L);
                }

                for (Application application : applications) {
                        ApplicationStatus status = application.getStatus();
                        if (status != null) {
                                statusTotals.put(status, statusTotals.getOrDefault(status, 0L) + 1L);
                        }
                }

                return ApplicationStatisticsResponse.builder()
                                .total((long) applications.size())
                                .draft(statusTotals.getOrDefault(ApplicationStatus.DRAFT, 0L))
                                .pending(statusTotals.getOrDefault(ApplicationStatus.PENDING, 0L))
                                .approved(statusTotals.getOrDefault(ApplicationStatus.APPROVED, 0L))
                                .rejected(statusTotals.getOrDefault(ApplicationStatus.REJECTED, 0L))
                                .cancelled(statusTotals.getOrDefault(ApplicationStatus.CANCELLED, 0L))
                                .byUniversity(buildGroupStatistics(applications,
                                                application -> application.getMajor() != null
                                                                && application.getMajor().getUniversity() != null
                                                                                ? application.getMajor().getUniversity()
                                                                                : null))
                                .byMajor(buildGroupStatistics(applications, Application::getMajor))
                                .byAdmissionRound(buildGroupStatistics(applications, Application::getAdmissionRound))
                                .build();
        }

        private List<ApplicationStatisticsGroupResponse> buildGroupStatistics(List<Application> applications,
                        Function<Application, Object> groupExtractor) {
                Map<Long, GroupAccumulator> grouped = new HashMap<>();

                for (Application application : applications) {
                        Object group = groupExtractor.apply(application);
                        if (group == null) {
                                continue;
                        }

                        Long id;
                        String code;
                        String name;

                        if (group instanceof com.uniadmission.backend.entity.University) {
                                com.uniadmission.backend.entity.University university = (com.uniadmission.backend.entity.University) group;
                                id = university.getId();
                                code = university.getCode();
                                name = university.getName();
                        } else if (group instanceof Major) {
                                Major major = (Major) group;
                                id = major.getId();
                                code = major.getCode();
                                name = major.getName();
                        } else if (group instanceof AdmissionRound) {
                                AdmissionRound admissionRound = (AdmissionRound) group;
                                id = admissionRound.getId();
                                code = admissionRound.getCode();
                                name = admissionRound.getName();
                        } else {
                                continue;
                        }

                        if (id == null) {
                                continue;
                        }

                        GroupAccumulator accumulator = grouped.computeIfAbsent(id,
                                        ignored -> new GroupAccumulator(id, code, name));
                        accumulator.total++;

                        ApplicationStatus status = application.getStatus();
                        if (status != null) {
                                accumulator.increment(status);
                        }
                }

                return grouped.values().stream()
                                .sorted(Comparator.comparingLong(GroupAccumulator::getTotal).reversed()
                                                .thenComparing(GroupAccumulator::getName,
                                                                Comparator.nullsLast(String::compareToIgnoreCase)))
                                .map(GroupAccumulator::toResponse)
                                .collect(Collectors.toCollection(ArrayList::new));
        }

        private static class GroupAccumulator {
                private final Long id;
                private final String code;
                private final String name;
                private long total;
                private long draft;
                private long pending;
                private long approved;
                private long rejected;
                private long cancelled;

                private GroupAccumulator(Long id, String code, String name) {
                        this.id = id;
                        this.code = code;
                        this.name = name;
                }

                private void increment(ApplicationStatus status) {
                        switch (status) {
                                case DRAFT:
                                        draft++;
                                        break;
                                case PENDING:
                                        pending++;
                                        break;
                                case APPROVED:
                                        approved++;
                                        break;
                                case REJECTED:
                                        rejected++;
                                        break;
                                case CANCELLED:
                                        cancelled++;
                                        break;
                                default:
                                        break;
                        }
                }

                private long getTotal() {
                        return total;
                }

                private String getName() {
                        return name;
                }

                private ApplicationStatisticsGroupResponse toResponse() {
                        return ApplicationStatisticsGroupResponse.builder()
                                        .id(id)
                                        .code(code)
                                        .name(name)
                                        .total(total)
                                        .draft(draft)
                                        .pending(pending)
                                        .approved(approved)
                                        .rejected(rejected)
                                        .cancelled(cancelled)
                                        .build();
                }
        }

        private void applyStatusUpdate(Application application, ApplicationStatus status, String notes, Long adminId) {
                String oldStatus = application.getStatus() != null ? application.getStatus().name() : "PENDING";
                application.setStatus(status);
                applicationRepository.save(application);

                ApplicationReviewLog log = new ApplicationReviewLog();
                log.setApplicationId(application.getId());
                log.setAdminId(adminId);
                log.setOldStatus(oldStatus);
                log.setNewStatus(status.name());
                log.setNotes(notes);
                reviewLogRepository.save(log);

                try {
                        if (application.getCandidate() != null && application.getCandidate().getUser() != null) {
                                String email = application.getCandidate().getUser().getEmail();
                                String name = application.getCandidate().getUser().getFullName();

                                emailService.sendApplicationStatusEmail(email, name, status.name());

                                String title = "Cập nhật trạng thái hồ sơ xét tuyển";
                                String message = "Hồ sơ của bạn đã chuyển sang trạng thái: " + status.name()
                                                + ". Ghi chú: " + notes;
                                notificationService.createNotification(application.getCandidate().getUser().getId(),
                                                title,
                                                message);
                        }
                } catch (Exception e) {
                        System.err.println("Lỗi khi gửi email: " + e.getMessage());
                }
        }

        private String csvValue(Object value) {
                String text = value == null ? "" : String.valueOf(value);
                String escaped = text.replace("\"", "\"\"");
                return '"' + escaped + '"';
        }

        private Specification<Application> buildAdminApplicationSpecification(ApplicationStatus status,
                        Long universityId, Long majorId, Long admissionRoundId) {
                Specification<Application> specification = Specification.where(null);

                if (status != null) {
                        specification = specification.and((root, query, cb) -> cb.equal(root.get("status"), status));
                }

                if (universityId != null) {
                        specification = specification.and((root, query, cb) -> cb
                                        .equal(root.join("major").join("university").get("id"), universityId));
                }

                if (majorId != null) {
                        specification = specification
                                        .and((root, query, cb) -> cb.equal(root.get("major").get("id"), majorId));
                }

                if (admissionRoundId != null) {
                        specification = specification.and((root, query, cb) -> cb
                                        .equal(root.get("admissionRound").get("id"), admissionRoundId));
                }

                return specification;
        }
}
