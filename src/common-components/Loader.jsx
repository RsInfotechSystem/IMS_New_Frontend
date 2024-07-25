import React from "react";

const Loader = ({ text }) => {
  return (
    <div class="loader-layout">
      <div class="loader-grid">
        <div class="item1"></div>
        <div class="item2"></div>
        <div class="item3"></div>
        <div class="item4"></div>
      </div>
      <strong class="loader-text">{text}</strong>
    </div>
  );
};

export default Loader;
