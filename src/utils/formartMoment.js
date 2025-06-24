import moment from "moment";

export const formatMoment = (timestamp) => {
  if (!timestamp) return "";

  const now = moment();
  const then = moment(timestamp.toDate ? timestamp.toDate() : timestamp);
  const diff = moment.duration(now.diff(then));

  return (
    (diff.years() && `${diff.years()}y`) ||
    (diff.months() && `${diff.months()}mo`) ||
    (Math.floor(diff.asWeeks()) && `${Math.floor(diff.asWeeks())}w`) ||
    (diff.days() && `${diff.days()}d`) ||
    (diff.hours() && `${diff.hours()}h`) ||
    (diff.minutes() && `${diff.minutes()}min`) ||
    (diff.seconds() && `${diff.seconds()}s`) ||
    "now"
  );
};

