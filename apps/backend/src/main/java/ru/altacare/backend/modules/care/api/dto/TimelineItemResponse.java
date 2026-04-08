package ru.altacare.backend.modules.care.api.dto;

public record TimelineItemResponse(
        String id, String title, String description, String level, String timeLabel) {}
