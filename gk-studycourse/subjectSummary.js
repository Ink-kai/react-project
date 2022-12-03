let myCourse = {},
  page_size = 1000000,
  header = {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "sec-ch-ua":
        '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    },
    referrer: "https://lms.ouchn.cn/user/courses",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  };
// 试探题库数
let { total: total } = await myfetch(
  "https://lms.ouchn.cn/api/my-courses?conditions=%7B%22status%22:%5B%22ongoing%22%5D,%22keyword%22:%22%22%7D&fields=id,name,course_code,department(id,name),grade(id,name),klass(id,name),course_type,cover,small_cover,start_date,end_date,is_started,is_closed,academic_year_id,semester_id,credit,compulsory,second_name,display_name,created_user(id,name),org(is_enterprise_or_organization),org_id,public_scope,course_attributes(teaching_class_name,copy_status,tip,data),audit_status,audit_remark,can_withdraw_course,imported_from,allow_clone,is_instructor,is_team_teaching,academic_year(id,name),semester(id,name),instructors(id,name,email,avatar_small_url),is_master,is_child,has_synchronized,master_course(name)&page=1&page_size=1",
  header
);
// 获取所有课程
myCourse = await myfetch(
  "https://lms.ouchn.cn/api/my-courses?conditions=%7B%22status%22:%5B%22ongoing%22%5D,%22keyword%22:%22%22%7D&fields=id,name,course_code,department(id,name),grade(id,name),klass(id,name),course_type,cover,small_cover,start_date,end_date,is_started,is_closed,academic_year_id,semester_id,credit,compulsory,second_name,display_name,created_user(id,name),org(is_enterprise_or_organization),org_id,public_scope,course_attributes(teaching_class_name,copy_status,tip,data),audit_status,audit_remark,can_withdraw_course,imported_from,allow_clone,is_instructor,is_team_teaching,academic_year(id,name),semester(id,name),instructors(id,name,email,avatar_small_url),is_master,is_child,has_synchronized,master_course(name)&page=1&page_size=${total}",
  header
);
if (myCourse ?? "" !== "") {
  myCourse?.courses.map(async (item) => {
    header["referrer"] = `https://lms.ouchn.cn/course/${item.id}/ng`;
    // 获取课程中所有考试题库 libs：题库信息  total：题库数
    let { subject_libs: subject_libs, total: total } = await myfetch(
      `https://lms.ouchn.cn/api/course/${item.id}/subject-libs?keyword=&lib_type=all&page=1&page_size=${page_size}&parent_id=0&predicate=id&reverse=true`,
      header
    );
    if (subject_libs ?? "" !== "") {
      subject_libs.map(async (lib) => {
        header["referrer"] = `https://lms.ouchn.cn/course/${lib.id}/ng`;
        let { subjects: subjects } = await myfetch(
          `https://lms.ouchn.cn/api/subject-libs/${lib.id}`,
          header
        );
        /*
        论述题/简答题 以下type没有答案
        short_answer

        id                  题目编号
        description         题目
        correct_answers     正确答案
        options             单项选择题/判断题 Array
            content         内容
            is_answer       正确答案
        point               分数
        difficulty_level    题目难度
        last_updated_at     题目上传时间
        type                题型
         */
      });
    }
  });
}
let subjectEnum = {
  single_selection: "单选题",
  multiple_selection: "多选题",
  true_or_false: "判断题",
  fill_in_blank: "填空题",
  short_answer: "简答题",
  text: "文本",
  analysis: "综合题",
  matching: "匹配题",
  random: "随机题",
  cloze: "完形填空题",
};

function myfetch(url, header) {
  return fetch(url, header).then((res) => res.json());
}
