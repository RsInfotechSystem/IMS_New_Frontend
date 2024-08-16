import React, { useState, useEffect } from "react";

const CheckboxGroup = ({ options, selectedOptions, onToggle, _setMaterial }) => {
  return (
    <div className="checkbox-group">
      {options.map((option) => {
        const isChecked = selectedOptions.some(
          (selected) =>
            selected.categoryId === option.categoryId &&
            selected.brandId === option.brandId &&
            selected.modelId === option.modelId &&
            selected.parameterId === option.parameterId
        );

        return (
          <label
            key={option.categoryId || option.brandId || option.modelId || option.parameterId}
            className="checkbox-label"
          >
            <input type="checkbox" checked={isChecked} onChange={() => onToggle(option)} />
            &nbsp;&nbsp;
            {option?.category?.toUpperCase() ||
              option?.brand?.toUpperCase() ||
              option?.modelName?.toUpperCase() ||
              option?.parameterId?.toUpperCase()
              // (option?.parameter?.toUpperCase(),option?.parameterName?.toUpperCase())
              // option?.forEach((option) =>`${option.parameterId}${option.parameterName}`)
            }
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
  _setMaterial,
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

const FilterStructure = ({ data, selectedFilters, onFiltersChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    category: false,
    brand: false,
    model: false,
    parameter: false,
  });

  const [selectedValues, setSelectedValues] = useState({
    category: [],
    brand: [],
    model: [],
    parameter: [],
  });

  const [options, setOptions] = useState({
    category: [],
    brand: [],
    model: [],
    parameter: [],
  });

  useEffect(() => {
    const newOptions = {
      category: Array.from(
        new Set(
          data.map((item) =>
            JSON.stringify({
              categoryId: item?.categoryId?._id || "unknown",
              category: item?.categoryId?.name || "unknown",
            })
          )
        )
      ).map((item) => JSON.parse(item)),
    };

    setOptions((prev) => ({
      ...prev,
      category: newOptions.category,
    }));
  }, [data]);

  useEffect(() => {
    const selectedCategory = selectedValues.category[0];

    if (selectedCategory) {
      const brandOptions = Array.from(
        new Set(
          data
            .filter((item) => item.categoryId?._id === selectedCategory.categoryId)
            .map((item) =>
              JSON.stringify({
                brandId: item.brandId?._id,
                brand: item.brandId?.name,
              })
            )
        )
      ).map((item) => JSON.parse(item));

      const modelOptions = Array.from(
        new Set(
          data
            .filter((item) => item.categoryId?._id === selectedCategory.categoryId)
            .map((item) =>
              JSON.stringify({
                modelId: item.modelId?._id,
                modelName: item.modelId?.name,
              })
            )
        )
      ).map((item) => JSON.parse(item));

      // const parameterOptions = Array.from(
      //   new Set(
      //     data
      //       .filter((item) => item.categoryId?._id === selectedCategory.categoryId)
      //       .flatMap((item) => item.parameters || [])
      //       .map((param) =>
      //         JSON.stringify({
      //           parameterId: param?._id,
      //           parameter: param?.name,
      //         })
      //       )
      //   )
      // ).map((item) => JSON.parse(item));

      const parameterOptions = Array.from(
        new Set(
          data
            .filter((item) => item.categoryId?._id === selectedCategory.categoryId)
            .flatMap((item) =>
              Object.entries(item.parameter || {}).map(([key, value]) =>
                JSON.stringify({
                  parameterId: key.toUpperCase(), // Convert parameterId to uppercase
                  parameterName: value.toUpperCase(), // Convert parameterName to uppercase
                })
              )
            )
        )
      )
        .map((item) => JSON.parse(item))
        .reduce((acc, curr) => {
          if (!acc.some(option => option.parameterId === curr.parameterId)) {
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

      if (section === "category") {
        // Ensure only one selection at a time
        newValues[section] = [value];
        // Reset child sections if a new category is selected
        const sections = ["category", "brand", "model", "parameter"];
        const currentIndex = sections.indexOf(section);
        for (let i = currentIndex + 1; i < sections.length; i++) {
          newValues[sections[i]] = [];
        }
      } else {
        // Handle multiple selections for other sections (e.g., brand, model, etc.)
        const isSelected = newValues[section].some(
          (item) =>
            item.categoryId === value.categoryId &&
            item.brandId === value.brandId &&
            item.modelId === value.modelId &&
            item.parameterId === value.parameterId 
        );

        if (isSelected) {
          newValues[section] = newValues[section].filter(
            (item) =>
              item.categoryId !== value.categoryId ||
              item.brandId !== value.brandId ||
              item.modelId !== value.modelId ||
              item.parameterId !== value.parameterId 
          );
        } else {
          newValues[section] = [...newValues[section], value];
        }
      }
      console.log(newValues,"newValues");
      
      onFiltersChange({
        categoryId: newValues.category.length > 0 ? newValues.category[0].categoryId : "",
        brandId: newValues.brand.length > 0 ? newValues.brand[0].brandId : "",
        modelId: newValues.model.length > 0 ? newValues.model[0].modelId : "",
        parameter: newValues.parameter.length > 0 ? newValues.parameter[0].parameterId : "",
      });
      return newValues;
    });

    // Expand next section automatically
    const sections = ["category", "brand", "model", "parameter"];
    const currentIndex = sections.indexOf(section);
    const nextIndex = currentIndex + 1;
    if (nextIndex < sections.length) {
      setExpandedSections((prev) => ({ ...prev, [sections[nextIndex]]: true }));
    }

    console.log("Selected values:", selectedValues);
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
      >
        <ExpandableSection
          title="Brand"
          isExpanded={expandedSections.brand}
          onToggle={() => toggleSection("brand")}
          options={options.brand}
          selectedOptions={selectedValues.brand}
          onCheckboxToggle={(value) => handleCheckboxToggle("brand", value)}
        >
          <ExpandableSection
            title="Model"
            isExpanded={expandedSections.model}
            onToggle={() => toggleSection("model")}
            options={options.model}
            selectedOptions={selectedValues.model}
            onCheckboxToggle={(value) => handleCheckboxToggle("model", value)}
          >
            <ExpandableSection
              title="Parameter"
              isExpanded={expandedSections.parameter}
              onToggle={() => toggleSection("parameter")}
              options={options.parameter}
              selectedOptions={selectedValues.parameter}
              onCheckboxToggle={(value) => handleCheckboxToggle("parameter", value)}
            />
          </ExpandableSection>
        </ExpandableSection>
      </ExpandableSection>
    </div>
  );
};

export default FilterStructure;
