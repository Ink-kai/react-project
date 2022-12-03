let subjects,
  subjects_data,
  instance_id = [];
let { items: items } = await fetch(
  "https://lms.ouchn.cn/api/exam/30000059053/scores?page=1&page_size=1000000&conditions=%7B%22org_ids%22:[],%22department_ids%22:[],%22section_ids%22:[],%22klass_ids%22:[],%22grade_ids%22:[],%22submit_status%22:[%22submitted%22,%22makeup_submitted%22],%22mark_status%22:null,%22keyword%22:%22%22,%22sort_by%22:%7B%22predicate%22:%22id%22,%22reverse%22:false%7D%7D",
  {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "sec-ch-ua":
        '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Linux"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    },
    referrer: "https://lms.ouchn.cn/course/30000006857/learning-activity",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  }
).then((res) => res.json());
items.map(async (item) => {
  let {
    submission_data: submission_data,
    subjects_data: subjects_data,
    instance_id: instance_id,
  } = await fetch(
    // `https://lms.ouchn.cn/api/exams/30000059053/submissions/${item.exam_id}`,
    `https://lms.ouchn.cn/api/exams/30000059053/submissions/30010258324`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "sec-ch-ua":
          '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
      },
      //   referrer: `https://lms.ouchn.cn/exam/${item.exam_id}/subjects`,
      referrer: `https://lms.ouchn.cn/exam/30010258324/subjects`,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }
  ).then((res) => res.json());
  subjects = submission_data.subjects;
  if (subjects.length > 0) {
    subjects.map((subject) => {
      if (subject["answer"] ?? "" !== "") {
        let score = {};
        // score["examinee_id"] = item?.examinee_id;
        score["examinee_id"] = 30000523355;
        score["graded_subjects"] = {
          subject_id: subject.subject_id,
          score: parseInt(
            getArrayVal(subjects_data.subjects, subject.subject_id, "point")
          ),
          instance_id: instance_id,
          parent_id: null,
        };
        score["submission_id"] = 30010258324;
        // 30010258324
        fetch(
          `https://lms.ouchn.cn/api/exams/30000059053/give-score`,
          // `https://lms.ouchn.cn/api/exams/${subject.subject_id}/give-score`,
          {
            headers: {
              accept: "application/json, text/plain, */*",
              "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
              "content-type": "application/json;charset=UTF-8",
              "sec-ch-ua":
                '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Linux"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
            },
            referrer: "https://lms.ouchn.cn/exam/${exam_id}/subjects",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: JSON.stringify(score),
            //   body: '{"examinee_id":30000517634,"graded_subjects":[{"subject_id":30002832506,"score":"6","instance_id":30007717437,"parent_id":null}],"submission_id":30007796530}',
            method: "POST",
            mode: "cors",
            credentials: "include",
          }
        );
        let data={
            "org_id": globalData.course.orgId,
            "user_id": globalData.user.id,
            "course_id": globalData.course.id,
            "enrollment_role": "student_manager",
            "is_teacher": true,
            "activity_id": "30000059053",
            "activity_type": "exam",
            "activity_name": null,
            "module": null,
            "action": "give_score",
            "ts": new Date().getTime(),
            "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "mode": "normal",
            "channel": "web",
            "target_info": { "id": 30000523355, "type": "personal", "is_student": true },
            "master_course_id": 0,
            "org_name": globalData.user.orgName,
            "org_code": globalData.user.orgCode,
            "user_no": globalData.user.userNo,
            "user_name": globalData.user.name,
            "course_code": globalData.course.courseCode,
            "course_name": globalData.course.name,
            "dep_id": globalData.dept.id,
            "dep_name": globalData.dept.name,
            "dep_code": globalData.dept.code
          }
          
        fetch("https://lms.ouchn.cn/statistics/api/learning-activity", {
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "content-type": "application/json; charset=UTF-8",
            "sec-ch-ua":
              '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Linux"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://lms.ouchn.cn/exam/30000059053/subjects",
          referrerPolicy: "strict-origin-when-cross-origin",
        //   body: '{"org_id":30000000003,"user_id":"30000626651","course_id":"30000006857","enrollment_role":"student_manager","is_teacher":true,"activity_id":"30000059053","activity_type":"exam","activity_name":null,"module":null,"action":"give_score","ts":1670005525565,"user_agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36","mode":"normal","channel":"web","target_info":{"id":30000523355,"type":"personal","is_student":true},"master_course_id":0,"org_name":"西安开放大学","org_code":"611","user_no":"6115019920814","user_name":"张文刚","course_code":"202209-00855611","course_name":"建筑材料(A)","dep_id":"30000000904","dep_name":"西安广播电视大学上林分校学习中心","dep_code":"6115000"}',
          body: JSON.stringify(data),
          method: "POST",
          mode: "cors",
          credentials: "include",
        });
      }
    });
  }
});
//   对比分数
function getArrayVal(arr, id, val) {
  let res = "";
  if (arr.length < 1) {
    return null;
  }
  arr.find((item) => {
    if (item["id"] === id) {
      res = item[val];
    }
  });
  return res;
}
