const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length === 0) return "";

  if (cleaned.length <= 1) return `+7`;

  if (cleaned.startsWith("7")) {
    const formatted = cleaned.match(/^7(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    if (formatted) {
      return `+7${formatted[1] ? ` (${formatted[1]}` : ""}${formatted[1] && formatted[1].length === 3 ? ")" : ""}${formatted[2] ? ` ${formatted[2]}` : ""}${formatted[3] ? `-${formatted[3]}` : ""}${formatted[4] ? `-${formatted[4]}` : ""}`;
    }
  }

  return value;
};

export default formatPhoneNumber;
