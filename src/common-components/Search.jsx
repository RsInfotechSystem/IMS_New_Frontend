"use client"
const Search = ({ value, onChange, placeholder }) => {
  return (
    <div className="search_box">
      <input
        type="text"
        className="search_input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <div className="search_svg">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_279_4430)">
            <mask
              id="mask0_279_4430"
              style={{ maskType: "luminance" }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="24"
              height="24"
            >
              <path d="M24 0H0V24H24V0Z" fill="white" />
            </mask>
            <g mask="url(#mask0_279_4430)">
              <path
                d="M10.5 17C14.0899 17 17 14.0899 17 10.5C17 6.91015 14.0899 4 10.5 4C6.91015 4 4 6.91015 4 10.5C4 14.0899 6.91015 17 10.5 17Z"
                stroke="#198754"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
              <path
                d="M19.6465 19.6466L15.3536 15.3537L15.3537 15.3536L19.6466 19.6465L19.6465 19.6466Z"
                fill="#919191"
                stroke="#198754"
              />
            </g>
          </g>
          <defs>
            <clipPath id="clip0_279_4430">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default Search;
