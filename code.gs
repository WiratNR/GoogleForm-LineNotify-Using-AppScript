
// Discord embed limits
const maxTextLength = 1024;
const maxFields = 25;
const hideResponses = false;
const hideEmptyRows = true;

const submitPost = (e) => {
  const formTitle = e.source.getTitle() ?? 'Untitled Form';
  var txt = ""
  const responses = e.response.getItemResponses();
  if (!hideResponses) {
    // extract responses
    const payload = extractResponses(responses);
    if (!payload.length) return;
    for (var i = 0; i < payload.length; i++) {
      txt += "\n" + payload[i].name + ":\n" + payload[i].value + "\n"
    }

    //ถ้าต้องการส่งได้หลายกลุ่ม ก็   const token = ["token1","token2"]
    const token = ["token1"]

    for (var j = 0; j <= token.length; j++) {
      sendLineNotify(token[j], txt)
    }
  }
};


const extractResponses = (responses) => {
  // format each response
  const payload = [];
  responses.forEach(response => {
    const item = response.getItem();
    let resp = response.getResponse();
    let respFmt, questions;
    switch (item.getType()) {
      case FormApp.ItemType.CHECKBOX:
        // display checkbox responses on separate lines
        resp = resp.join('\n');
        break;
      case FormApp.ItemType.FILE_UPLOAD:
        // generate URL for uploaded files
        resp = resp.map(
          fileID => 'https://drive.google.com/open?id=' + fileID
        ).join('\n');
        break;
      case FormApp.ItemType.GRID:
        // display grid responses on separate lines
        respFmt = []
        questions = item.asGridItem().getRows();
        resp.forEach((answer, index) => {
          // exclude empty responses unless specified otherwise
          if (!hideEmptyRows || answer !== null)
            respFmt.push(`${questions[index]}: ${Array.isArray(answer) ? answer.join(', ') : answer}`);
        });
        resp = respFmt.join('\n');
        break;
      case FormApp.ItemType.CHECKBOX_GRID:
        respFmt = []
        questions = item.asCheckboxGridItem().getRows();
        resp.forEach((answer, index) => {
          if (!hideEmptyRows || answer !== null)
            respFmt.push(`${questions[index]}: ${Array.isArray(answer) ? answer.join(', ') : answer}`);
        });
        resp = respFmt.join('\n');
        break;

      case FormApp.ItemType.DATE:
        const dataThai = (resp).toString().split('-') // ปี เดือน วัน
        const yearThai = parseInt(dataThai[0]) + 543
        resp = dataThai[2] + "/" + dataThai[1] + "/" + yearThai // วัน เดือน ปี
        break;

      default:
        // short answer, paragraph, multiple choice, linear scale, datetime
        break;
    }

    if (resp) payload.push({
      //ปรับหัวข้อ และ ข้อมูล
      'name': item.getTitle(),
      'value': (resp.length <= maxTextLength) ? resp : resp.slice(0, maxTextLength - 3) + '...'
    }

    );
  });

  return payload;
};

const sendLineNotify = (token, txt) => {
  //const notify = new lib.lineNotify(token)
  //notify.sendText(txt)

  //update new

  const url = "https://notify-api.line.me/api/notify";
  const headers = {
    "Authorization": "Bearer "+token
  };
  
  const payload = {
    "message": txt
  };

  const options = {
    "method": "post",
    "headers": headers,
    "payload": payload
  };

  UrlFetchApp.fetch(url, options);
}

