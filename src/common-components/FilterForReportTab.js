import React, { useState, useEffect } from "react";

const CheckboxGroup = ({ options, selectedOptions, onToggle }) => {
    return (
        <div className="checkbox-group">
            {options.map((option) => {
                const isChecked = selectedOptions.some(
                    (selected) =>
                        selected.id === option.id &&
                        selected.value === option.value
                );

                return (
                    <label
                        key={option.id}
                        className="checkbox-label"
                    >
                        <input type="checkbox" checked={isChecked} onChange={() => onToggle(option)} />
                        &nbsp;&nbsp;
                        {option.value.toUpperCase()}
                    </label>
                );
            })}
        </div>
    );
};

const ExpandableSection = ({
    title,
    children,
    isExpanded,
    onToggle,
    options,
    selectedOptions,
    onCheckboxToggle,
}) => {
    return (
        <div className="expandable-section">
            <div className="section-header" onClick={onToggle}>
                {isExpanded ? "▼" : "▶"} {title}
            </div>
            {isExpanded && (
                <div className="section-content">
                    <CheckboxGroup
                        options={options}
                        selectedOptions={selectedOptions}
                        onToggle={onCheckboxToggle}
                    />
                    {children}
                </div>
            )}
        </div>
    );
};

const CustomReportFilter = ({ data, selectedFilters, onFiltersChange }) => {
    const [expandedSections, setExpandedSections] = useState({
        category: false,
        brand: false,
        model: false,
        parameter: false,
        location: false,
        status: false,
        conditionType: false,
    });

    const [selectedValues, setSelectedValues] = useState({
        category: [],
        brand: [],
        model: [],
        parameter: [],
        location: [],
        status: [],
        conditionType: [],
    });

    const [options, setOptions] = useState({
        category: [],
        brand: [],
        model: [],
        parameter: [],
        location: [],
        status: [],
        conditionType: [],
    });

    useEffect(() => {
        const newOptions = {
            category: Array.from(
                new Set(
                    data?.map((item) =>
                        JSON.stringify({
                            id: item?.categoryId?._id || "unknown",
                            value: item?.categoryId?.name || "unknown",
                        })
                    )
                )
            ).map((item) => JSON.parse(item)),
            location: Array.from(
                new Set(
                    data?.map((item) =>
                        JSON.stringify({
                            id: item?.locationId?._id || "unknown",
                            value: item?.location || "unknown",
                        })
                    )
                )
            ).map((item) => JSON.parse(item)),
            status: Array.from(
                new Set(
                    data?.map((item) =>
                        JSON.stringify({
                            id: item?.status,
                            value: item?.status,
                        })
                    )
                )
            ).map((item) => JSON.parse(item)),
            conditionType: Array.from(
                new Set(
                    data?.map((item) =>
                        JSON.stringify({
                            id: item?.conditionType,
                            value: item?.conditionType,
                        })
                    )
                )
            ).map((item) => JSON.parse(item)),
        };

        setOptions((prev) => ({
            ...prev,
            ...newOptions,
        }));
    }, [data]);

    useEffect(() => {
        const selectedCategory = selectedValues.category[0];

        if (selectedCategory) {
            const brandOptions = Array.from(
                new Set(
                    data
                        .filter((item) => item.categoryId?._id === selectedCategory.id)
                        .map((item) =>
                            JSON.stringify({
                                id: item.brandId?._id,
                                value: item.brandId?.name,
                            })
                        )
                )
            ).map((item) => JSON.parse(item));

            const modelOptions = Array.from(
                new Set(
                    data
                        .filter((item) => item.categoryId?._id === selectedCategory.id)
                        .map((item) =>
                            JSON.stringify({
                                id: item.modelId?._id,
                                value: item.modelId?.name,
                            })
                        )
                )
            ).map((item) => JSON.parse(item));

            const parameterOptions = Array.from(
                new Set(
                    data
                        .filter((item) => item.categoryId?._id === selectedCategory.id)
                        .flatMap((item) =>
                            Object.entries(item.parameter || {}).map(([key, value]) =>
                                JSON.stringify({
                                    id: typeof key === 'string' ? key.toUpperCase() : key,
                                    value: typeof value === 'string' ? value.toUpperCase() : value,
                                })
                            )
                        )
                )
            )
                .map((item) => JSON.parse(item))
                .reduce((acc, curr) => {
                    if (!acc.some(option => option.id === curr.id)) {
                        acc.push(curr);
                    }
                    return acc;
                }, []);

            setOptions((prev) => ({
                ...prev,
                brand: brandOptions,
                model: modelOptions,
                parameter: parameterOptions,
            }));
        } else {
            setOptions((prev) => ({
                ...prev,
                brand: [],
                model: [],
                parameter: [],
            }));
        }
    }, [data, selectedValues.category]);

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCheckboxToggle = (section, value) => {
        setSelectedValues((prev) => {
            const newValues = { ...prev };
            const isSelected = newValues[section].some(
                (item) => item.id === value.id && item.value === value.value
            );

            if (isSelected) {
                newValues[section] = newValues[section].filter(
                    (item) => item.id !== value.id || item.value !== value.value
                );
            } else {
                newValues[section] = [...newValues[section], value];
            }

            onFiltersChange({
                categoryId: newValues.category.map(item => item.id),
                brandId: newValues.brand.map(item => item.id),
                modelId: newValues.model.map(item => item.id),
                parameter: newValues.parameter.map(item => item.id),
                location: newValues.location.map(item => item.value),
                status: newValues.status.map(item => item.value),
                conditionType: newValues.conditionType.map(item => item.value),
            });

            return newValues;
        });
    };

    return (
        <div className="filter-structure">
            <ExpandableSection
                title="Category"
                isExpanded={expandedSections.category}
                onToggle={() => toggleSection("category")}
                options={options.category}
                selectedOptions={selectedValues.category}
                onCheckboxToggle={(value) => handleCheckboxToggle("category", value)}
            />
            <ExpandableSection
                title="Brand"
                isExpanded={expandedSections.brand}
                onToggle={() => toggleSection("brand")}
                options={options.brand}
                selectedOptions={selectedValues.brand}
                onCheckboxToggle={(value) => handleCheckboxToggle("brand", value)}
            />
            <ExpandableSection
                title="Model"
                isExpanded={expandedSections.model}
                onToggle={() => toggleSection("model")}
                options={options.model}
                selectedOptions={selectedValues.model}
                onCheckboxToggle={(value) => handleCheckboxToggle("model", value)}
            />
            <ExpandableSection
                title="Parameter"
                isExpanded={expandedSections.parameter}
                onToggle={() => toggleSection("parameter")}
                options={options.parameter}
                selectedOptions={selectedValues.parameter}
                onCheckboxToggle={(value) => handleCheckboxToggle("parameter", value)}
            />
            <ExpandableSection
                title="Location"
                isExpanded={expandedSections.location}
                onToggle={() => toggleSection("location")}
                options={options.location}
                selectedOptions={selectedValues.location}
                onCheckboxToggle={(value) => handleCheckboxToggle("location", value)}
            />
            <ExpandableSection
                title="Status"
                isExpanded={expandedSections.status}
                onToggle={() => toggleSection("status")}
                options={options.status}
                selectedOptions={selectedValues.status}
                onCheckboxToggle={(value) => handleCheckboxToggle("status", value)}
            />
            <ExpandableSection
                title="Condition Type"
                isExpanded={expandedSections.conditionType}
                onToggle={() => toggleSection("conditionType")}
                options={options.conditionType}
                selectedOptions={selectedValues.conditionType}
                onCheckboxToggle={(value) => handleCheckboxToggle("conditionType", value)}
            />
        </div>
    );
};

export default CustomReportFilter;