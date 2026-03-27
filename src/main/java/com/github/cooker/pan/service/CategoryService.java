package com.github.cooker.pan.service;

import com.github.cooker.pan.dto.CategoryDto;
import com.github.cooker.pan.dto.CreateCategoryRequest;
import com.github.cooker.pan.dto.UpdateCategoryRequest;
import com.github.cooker.pan.repository.CategoryRepository;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDto> list() {
        return categoryRepository.findAllOrdered();
    }

    public long create(CreateCategoryRequest request) {
        int sort = request.sortOrder() != null ? request.sortOrder() : 0;
        try {
            return categoryRepository.insert(request.name(), sort);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "分类名称已存在");
        }
    }

    public void update(long id, UpdateCategoryRequest request) {
        if (!categoryRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "分类不存在");
        }
        int sort = request.sortOrder() != null ? request.sortOrder() : 0;
        try {
            if (categoryRepository.update(id, request.name(), sort) == 0) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "分类不存在");
            }
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "分类名称已存在");
        }
    }

    public void delete(long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "分类不存在");
        }
        categoryRepository.delete(id);
    }
}
