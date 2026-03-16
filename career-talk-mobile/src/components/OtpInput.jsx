import React from "react";

const OtpInput = ({ otp, setOtp }) => {
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
      {otp.map((value, index) => (
        <input
          key={index}
          id={`otp-${index}`}
          value={value}
          maxLength="1"
          onChange={(e) => handleChange(e, index)}
          style={{
            width: "50px",
            height: "50px",
            fontSize: "20px",
            textAlign: "center",
            borderRadius: "10px",
            border: "1px solid lightgray",
          }}
        />
      ))}
    </div>
  );
};

export default OtpInput;
