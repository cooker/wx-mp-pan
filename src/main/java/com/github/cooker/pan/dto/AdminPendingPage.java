package com.github.cooker.pan.dto;

import java.util.List;

public record AdminPendingPage(long total, List<PendingResourceDto> items) {}
