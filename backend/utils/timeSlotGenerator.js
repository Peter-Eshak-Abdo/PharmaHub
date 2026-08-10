function generateTimeslots(startTime, endTime, slotDurationMinutes) {
    const slots = [];
    const [startH, startM] =startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let current = startH*60 +startM;
    const end = endH*60 + endM;
    while (current+ slotDurationMinutes <= end) {
        const slotstart = current;
        const slotEnd = current + slotDurationMinutes;
        const format = (mins)=>{
            const h=Math.floor(mins/60).toString().padStart(2,'0');
            const m=(mins%60).toString().padStart(2,'0');
            return `${h}:${m}`;
        };
        slots.push({start:format(slotstart), end:format(slotEnd)});
        current += slotDurationMinutes;
    }
    return slots;
}
module.exports = { generateTimeslots };