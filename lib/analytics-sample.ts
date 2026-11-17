// SAMPLE figures for the analytics screen. The simulator keeps no trip history, so a real system would
// compute these from completed trips. The screen says so.
export const delayByRoute: [route: string, min: number][] = [["12", 14], ["45", 11], ["31", 8], ["24", 6], ["8", 3], ["17", 2]];
export const delayByHour: [range: string, min: number][] = [["07-09", 9], ["09-11", 7], ["11-15", 3], ["15-17", 6], ["17-20", 13], ["20-22", 4]];
export const affectedBuses: [bus: string, breakdowns: number][] = [["45", 4], ["12", 3], ["31", 2], ["8", 1]];
export const summary = { onTime: "81%", avgDelay: 6, tripTime: 74, breakdowns: 11 };
