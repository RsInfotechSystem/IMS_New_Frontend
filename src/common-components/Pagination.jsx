"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";

const Pagination = ({
  isPageUpdated,
  setIsPageUpdated,
  currentPage,
  setCurrentPage,
  pageCount,
}) => {
  return (
    <div className="pagination">
      <button
        onClick={() => {
          setCurrentPage(1);
          setIsPageUpdated(!isPageUpdated);
        }}
        disabled={
          currentPage === 1 || currentPage === "" || pageCount === 0
            ? true
            : false
        }
      >
        <p>First</p>
      </button>

      <button
        onClick={() => {
          setCurrentPage(currentPage - 1);
          setIsPageUpdated(!isPageUpdated);
        }}
        disabled={currentPage === 1 || pageCount === 1 ? true : false}
      >
        <FontAwesomeIcon icon={faAngleLeft} className="fontAwesome_icon" />
      </button>

      <input
        type="number"
        value={currentPage}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            setIsPageUpdated(!isPageUpdated);
          }
        }}
        onChange={(event) =>
          setCurrentPage(
            event.target.value > pageCount
              ? pageCount
              : event.target.value && event.target.value <= 1
              ? 1
              : event.target.value
          )
        }
        className="form-control"
      />
      <div className="pagination_total_count">
        <h5>of</h5>
        <h5>{pageCount}</h5>
      </div>

      <button
        onClick={() => {
          setCurrentPage(currentPage + 1);
          setIsPageUpdated(!isPageUpdated);
        }}
        disabled={currentPage >= pageCount || pageCount === 1 ? true : false}
      >
        <FontAwesomeIcon icon={faAngleRight} className="fontAwesome_icon" />
      </button>

      <button
        onClick={() => {
          setCurrentPage(pageCount);
          setIsPageUpdated(!isPageUpdated);
        }}
        disabled={
          currentPage === pageCount || currentPage === "" || pageCount === 0
            ? true
            : false
        }
      >
        <p>Last</p>
      </button>
    </div>
  );
};

export default Pagination;
