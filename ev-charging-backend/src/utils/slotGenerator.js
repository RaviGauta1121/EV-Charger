// ============================
// utils/slotGenerator.js
// ============================

function generateTimeSlots(startHour = 6, endHour = 22, step = 30) {
  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += step) {
      const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const endM = m + step;
      const endH = endM >= 60 ? h + 1 : h;
      const endMin = endM >= 60 ? endM - 60 : endM;
      const end = `${String(endH).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
      slots.push(`${start}-${end}`);
    }
  }
  return slots;
}

module.exports = { generateTimeSlots };