export const updateCountHourMinutesSeconds = (
  seconds: number,
  minutes: number,
  hours: number
) => {
  let updateSeconds = seconds;
  let updateMinutes = minutes;
  let updateHours = hours;

  updateSeconds++;
  if (updateSeconds == 60) {
    updateSeconds = 0;
    updateMinutes++;
    if (updateMinutes == 60) {
      updateMinutes = 0;
      updateHours++;
    }
  }

  return {
    updateSeconds,
    updateMinutes,
    updateHours,
  };
};
