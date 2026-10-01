export function validateLead(phone, age) {
  if (!phone.trim()) return "请填写家长手机号";
  if (!/^1[3-9]\d{9}$/.test(phone.trim())) return "请填写正确的11位手机号";
  if (!age) return "请选择孩子年龄段";
  return "";
}
