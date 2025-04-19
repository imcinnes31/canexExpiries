import {easter} from 'date-easter';

function getLocalDate() {
    const date1 = new Date();
    const date2 = new Date(date1);
    // const durationInMinutes = date1.getTimezoneOffset();
    // date2.setMinutes(date1.getMinutes() - durationInMinutes)
    date2.setMinutes(date1.getMinutes() - 300);
    const date3 = date2.toISOString().split("T")[0] + "T00:00:00.000+00:00";
    return new Date(date3);
}

function addDays(numDays) {
    return new Date(getLocalDate().getTime() + (numDays * 86400000));
}  

export const storeClosedSunday = true;

const easterSundayCalc = new Date(easter(getLocalDate().getFullYear()).year + "-" + easter(getLocalDate().getFullYear()).month + "-" + easter(getLocalDate().getFullYear()).day);
const easterSunday = new Date(easterSundayCalc).toDateString();
const goodFriday = new Date(easterSundayCalc.getTime() - (2 * 86400000)).toDateString();
const easterMonday = new Date(easterSundayCalc.getTime() + (1 * 86400000)).toDateString();
const christmasDay = new Date(getLocalDate().getFullYear() + "-12-25").toDateString();
const newYearsDay = new Date((getLocalDate().getFullYear() + 1) + "-01-01").toDateString();
const truthDay = new Date(getLocalDate().getFullYear() + "-09-30").toDateString();
const remembranceDay = new Date(getLocalDate().getFullYear() + "-11-11").toDateString();
const canadaDay = new Date(getLocalDate().getFullYear() + "-07-01").toDateString();

const octoberFirst = new Date(getLocalDate().getFullYear() + "-10-01");
const tgDayOfWeekCalc = 15 - (octoberFirst.getDay() < 2 ? octoberFirst.getDay() + 7 : octoberFirst.getDay());
const tgDayCanada = new Date(octoberFirst.getTime() + (tgDayOfWeekCalc * 86400000)).toDateString();

const may24 = new Date(getLocalDate().getFullYear() + "-05-24");
const vdDayOfWeekCalc = 1 - (may24.getDay() == 0 ? may24.getDay() + 7 : may24.getDay());
const victoriaDay = new Date(may24.getTime() + (vdDayOfWeekCalc * 86400000)).toDateString();

const septemberFirst = new Date(getLocalDate().getFullYear() + "-09-01");
const ldDayOfWeekCalc = 8 - (septemberFirst.getDay() < 2 ? septemberFirst.getDay() + 7 : septemberFirst.getDay());
const laborDayCanada = new Date(septemberFirst.getTime() + (ldDayOfWeekCalc * 86400000)).toDateString();

const augustFirst = new Date(getLocalDate().getFullYear() + "-08-01");
const tfDayOfWeekCalc = 8 - (augustFirst.getDay() < 2 ? augustFirst.getDay() + 7 : augustFirst.getDay());
const terryFoxDay = new Date(augustFirst.getTime() + (tfDayOfWeekCalc * 86400000)).toDateString();

const februaryFirst = new Date(getLocalDate().getFullYear() + "-02-01");
const lrDayOfWeekCalc = 22 - (februaryFirst.getDay() < 2 ? februaryFirst.getDay() + 7 : februaryFirst.getDay());
const louisRielDay = new Date(februaryFirst.getTime() + (lrDayOfWeekCalc * 86400000)).toDateString();

export const storeHolidays = {
    [easterSunday]: "Easter Sunday",
    [goodFriday]: "Good Friday",
    [easterMonday]: "Easter Monday",
    [christmasDay]: "Christmas Day",
    [newYearsDay]: "New Years Day",
    [truthDay]: "Truth and Reconciliation Day",
    [tgDayCanada]: "Thanksgiving Monday",
    [remembranceDay]: "Remembrance Day",
    [victoriaDay]: "Victoria Day",
    [canadaDay]: "Canada Day",
    [laborDayCanada]: "Labor Day",
    [terryFoxDay]: "Terry Fox Day",
    [louisRielDay]: "Louis Riel Day",
}

export const storeHolidayArray = Object.keys(storeHolidays);
