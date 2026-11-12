/**
 * Clean phone number string into international format suitable for wa.me link.
 * E.g., "9876543210" -> "919876543210" (prepending 91 for India if 10 digits)
 */
export const formatWhatsAppNumber = (phone?: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
};

/**
 * Generate 1-click WhatsApp URL for Absentee Student Notification
 */
export const getAbsenteeWhatsAppUrl = (
  phone: string,
  studentName: string,
  date: string,
  className?: string
): string => {
  const cleanPhone = formatWhatsAppNumber(phone);
  if (!cleanPhone) return '#';

  const message = `Dear Parent, ${studentName}${className ? ` (${className})` : ''} was marked ABSENT for tuition classes on ${date}. Please let us know if you have any questions or contact us at 8667330368. - Honey Bees Tuition Center`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Generate 1-click WhatsApp URL for Overdue Fee Reminder
 */
export const getFeeReminderWhatsAppUrl = (
  phone: string,
  studentName: string,
  dueAmount: number,
  unpaidMonthsText?: string
): string => {
  const cleanPhone = formatWhatsAppNumber(phone);
  if (!cleanPhone) return '#';

  const monthContext = unpaidMonthsText ? `for ${unpaidMonthsText}` : 'for recent tuition classes';
  const message = `Dear Parent, This is a gentle reminder from Honey Bees Tuition Center that tuition fees for ${studentName} ${monthContext} (Total Due: ₹${dueAmount.toLocaleString('en-IN')}) are pending after the 15th of the month. Kindly arrange for payment at your earliest convenience. Thank you!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Generate 1-click WhatsApp URL for Fee Payment Receipt Acknowledgement
 */
export const getPaymentReceiptWhatsAppUrl = (
  phone: string,
  studentName: string,
  amount: number,
  paymentDate: string,
  method?: string,
  notes?: string
): string => {
  const cleanPhone = formatWhatsAppNumber(phone);
  if (!cleanPhone) return '#';

  let message = `Dear Parent, Thank you! We have received a tuition fee payment of ₹${amount.toLocaleString('en-IN')} for ${studentName} on ${paymentDate}.`;
  if (method) message += ` Method: ${method}.`;
  if (notes) message += ` Ref: ${notes}.`;
  message += ` - Honey Bees Tuition Center`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Generate 1-click WhatsApp URL for Play School Absentee Notification
 */
export const getSchoolAbsenteeWhatsAppUrl = (
  phone: string,
  studentName: string,
  date: string,
  group?: string
): string => {
  const cleanPhone = formatWhatsAppNumber(phone);
  if (!cleanPhone) return '#';

  const message = `Dear Parent, ${studentName}${group ? ` (${group})` : ''} was marked ABSENT for Honey Bees Play School on ${date}. Please let us know if everything is okay or contact us at 8667330368. - Honey Bees Play School`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Generate 1-click WhatsApp URL for Play School Fee Reminder
 */
export const getSchoolFeeReminderWhatsAppUrl = (
  phone: string,
  studentName: string,
  dueAmount: number,
  unpaidMonthsText?: string
): string => {
  const cleanPhone = formatWhatsAppNumber(phone);
  if (!cleanPhone) return '#';

  const monthContext = unpaidMonthsText ? `for ${unpaidMonthsText}` : 'for recent play school months';
  const message = `Dear Parent, This is a gentle reminder from Honey Bees Play School that school fees for ${studentName} ${monthContext} (Total Due: ₹${dueAmount.toLocaleString('en-IN')}) are pending. Kindly arrange for payment at your earliest convenience. Thank you!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Generate 1-click WhatsApp URL for Play School Fee Payment Receipt
 */
export const getSchoolPaymentReceiptWhatsAppUrl = (
  phone: string,
  studentName: string,
  amount: number,
  paymentDate: string,
  method?: string,
  notes?: string
): string => {
  const cleanPhone = formatWhatsAppNumber(phone);
  if (!cleanPhone) return '#';

  let message = `Dear Parent, Thank you! We have received a play school fee payment of ₹${amount.toLocaleString('en-IN')} for ${studentName} on ${paymentDate}.`;
  if (method) message += ` Method: ${method}.`;
  if (notes) message += ` Ref: ${notes}.`;
  message += ` - Honey Bees Play School`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Generate 1-click WhatsApp URL for Teacher Salary Payment Slip
 */
export const getTeacherSalaryWhatsAppUrl = (
  phone: string,
  teacherName: string,
  amount: number,
  monthName: string,
  paymentDate: string,
  method?: string
): string => {
  const cleanPhone = formatWhatsAppNumber(phone);
  if (!cleanPhone) return '#';

  let message = `Dear ${teacherName}, Your salary of ₹${amount.toLocaleString('en-IN')} for ${monthName} has been processed on ${paymentDate}`;
  if (method) message += ` via ${method}`;
  message += `. Thank you for your dedication! - Honey Bees Play School`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Generate 1-click WhatsApp URL for a custom message
 */
export const getCustomWhatsAppUrl = (phone: string, message: string): string => {
  const cleanPhone = formatWhatsAppNumber(phone);
  if (!cleanPhone) return '#';
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
