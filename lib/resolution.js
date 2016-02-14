exports.millisInResultion = function(resolution) {
  switch (resolution) {
    case exports.resolution.year:
      return 31540000000;
    case exports.resolution.month:
      return 2628000000;
    case exports.resolution.day:
      return 86400000;
    case exports.resolution.hour:
      return 3600000;
    case exports.resolution.minute:
      return 60000;
    case exports.resolution.second:
      return 1000;
    default:
      return 1;
  }
}

exports.convertDateForResolution = function(oldDate,resolution) {
  var year = resolution >= exports.resolution.year ? oldDate.getFullYear() : 0;
  var month = resolution >= exports.resolution.month ? oldDate.getMonth() : 0;
  var date = resolution >= exports.resolution.day ? oldDate.getDate() : 0;
  var hours = resolution >= exports.resolution.hour ? oldDate.getHours() : 0;
  var minutes = resolution >= exports.resolution.minute ? oldDate.getMinutes() : 0;
  var seconds = resolution >= exports.resolution.second ? oldDate.getSeconds() : 0;
  return new Date(year,month,date,hours,minutes,seconds);
}

exports.resolution = {
  'year': 0,
  'month': 1,
  'day': 2,
  'hour': 3,
  'minute': 4,
  'second': 5
};
