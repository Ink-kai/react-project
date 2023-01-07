// ==UserScript==
// @name            新国开秒刷视频、链接
// @namespace       https://ink-kai.github.io/
// @license         MIT
// @version         1.6.4   刷音视频增加延时
// @description     1.6.3   修复学习行为音频未增加的bug
// @description     1.6.2   修复学习行为未增加的bug
// @description     1.6.1   解决上锁视频自动刷异常
// @description     1.6     1.加锁视频自动刷（思政课、形式与政策等）
// @description             2.界面提示“刷完了”后，1.5秒自动刷新页面，方便查看进度（只有第一次刷课程的才有自动刷新）
// @description             3.关闭自动发帖
// @description             4.优化文本框复制粘贴
// @description     1.5.1   修复视频、进度未增加的bug
// @description     1.5     增加自动回帖（发过贴则不再发）
// @description             解决提交作业页面文字不能复制。仅限提交作业页面，有个文本编辑器的地方
// @description             兼容Firefox浏览器header
// @description     1.4     提供音频、文本刷新。该版本主要是代码重构
// @description     1.3.2   代码优化
// @description     1.3     打开课程页面，刷视频，同时增加学习行为的记录访问
// @description     1.0     打开课程页面，刷视频
// @author      Ink
// @concat      <h3 style="color:red;font-weight:bolder;">有问题来qq群号：682656158</h3>
// @match       *lms.ouchn.cn/course/*
// @icon        https://icons.duckduckgo.com/ip2/ouchn.cn.ico
// @require     http://cdn.bootcss.com/jquery/1.8.3/jquery.min.js
// @require     https://cdn.jsdelivr.net/npm/sweetalert2@8
// @require     https://cdn.bootcdn.net/ajax/libs/moment.js/2.29.4/moment.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// ==/UserScript==
(function () {
  window.onload = function () {
    var href = window.location.href;
    /* 课程页面 */
    if (/lms.ouchn.cn\/course\/(\d+)/.test(href)) {
      setTimeout(async () => {
        "use strict";
        if (location.protocol.includes("https") == false) {
          showMsg("网站没有https协议，请注意安全", "warning", "top-end");
        }
        var allmodule = $(
            ".module-list.gtm-category.open-university .module.ng-scope"
          ),
          page_courseid = /(\d+)/.exec(window.location.href)[1];
        var url,
          allURL = [];
        var fetchHeader = {
          headers: {
            accept: "*/*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "cache-control": "no-cache",
            "content-type": "application/json",
            pragma: "no-cache",
            "sec-ch-ua":
              '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer:
            "https://lms.ouchn.cn/course/14227/learning-activity/full-screen",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: "{}",
          method: "POST",
          mode: "cors",
          credentials: "include",
        };
        let fetchGetHeader = {
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "cache-control": "no-cache",
            pragma: "no-cache",
            "sec-ch-ua":
              '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
          },
          referrer:
            "https://lms.ouchn.cn/course/10000003894/learning-activity/full-screen",
          body: null,
          method: "GET",
          mode: "cors",
          credentials: "include",
        };
        var moduleids = [];
        Array.from(allmodule).forEach((item) => {
          var moduleid = /(\d)+/.exec(item.getAttribute("id"))[0];
          moduleids.push(moduleid);
        });
        url = `https://lms.ouchn.cn/api/course/${page_courseid}/all-activities?module_ids=[${moduleids}]&activity_types=learning_activities,exams,classrooms,live_records,rollcalls&no-loading-animation=true`;
        var header1 = Object.assign({}, fetchHeader);
        delete header1.headers["x-requested-with"];
        delete header1.body;
        header1.method = "GET";
        header1.accept = "application/json, text/plain, */*";
        header1.referrer = `https://lms.ouchn.cn/course/${page_courseid}/ng`;
        let { learning_activities: learning_activities } = await fetch(
          url,
          header1
        ).then((sj) => sj.json());
        // 显示课程数
        showMsg(
          `需要刷的数据：${learning_activities.length}`,
          "info",
          "top-left",
          0
        );
        if (learning_activities != null || learning_activities !== undefined) {
          for (const item of learning_activities) {
            /*
              页面类型：forum', 'page', 'material', 'online_video', 'questionnaire',"homework","web_link"
              有英语底子或者网上查就知道
              */
            switch (item.type) {
              /* 页面 */
              case "page":
              case "forum":
              case "web_link":
              case "homework":
                var body = {
                  org_id: globalData.course.orgId,
                  user_id: globalData.user.id,
                  course_id: globalData.course.id,
                  enrollment_role: "student",
                  is_teacher: false,
                  activity_id: item.id,
                  activity_type: "page",
                  activity_name: null,
                  module: null,
                  action: "open",
                  ts: new Date().getTime(),
                  user_agent: window.navigator.userAgent,
                  mode: "normal",
                  channel: "web",
                  target_info: {},
                  master_course_id: globalData.course.id,
                  org_name: globalData.user.orgName,
                  org_code: globalData.user.orgCode,
                  user_no: globalData.user.userNo,
                  user_name: globalData.user.name,
                  course_code: globalData.course.courseCode,
                  course_name: globalData.course.name,
                  dep_id: globalData.dept.id,
                  dep_name: globalData.dept.name,
                  dep_code: globalData.dept.code,
                };
                allURL.push({
                  url: `https://lms.ouchn.cn/statistics/api/learning-activity`,
                  header: body,
                  min: 3,
                  max: 5,
                });
                allURL.push({
                  url: `https://lms.ouchn.cn/api/activities/${item.id}`,
                  header: fetchGetHeader,
                  min: 3,
                  max: 5,
                });
                allURL.push({
                  url: `https://lms.ouchn.cn/api/course/activities-read/${item.id}`,
                  header: fetchGetHeader,
                  min: 3,
                  max: 5,
                });
                showMsg(`正在刷的课程：${item.title}`, "info", "top", 1000);
                // await ((item, b) => {
                //   return new Promise((resolve, reject) => {
                //     setTimeout(() => {
                //       Swal.fire({
                //         toast: true,
                //         position: "top",
                //         type: "info",
                //         title: `正在刷的课程：${item.title}`,
                //         showConfirmButton: false,
                //         timer: 1000,
                //       });
                //       Promise.all([
                //         statisticsReq(b),
                //         undefinedReq(item.id),
                //         LearnProcessReq(item.id),
                //       ]);
                //       resolve();
                //     }, 3000);
                //   });
                // })(item, body);
                break;
              case "online_video":
                var uploads = item.uploads;
                var duration;

                var tmpbody = {
                  user_id: globalData.user.id,
                  org_id: globalData.course.orgId,
                  course_id: globalData.course.id,
                  visit_duration: duration,
                  is_teacher: false,
                  browser: GetBrower(),
                  user_agent: window.navigator.userAgent,
                  master_course_id: globalData.course.id,
                  org_name: globalData.user.orgName,
                  org_code: globalData.user.orgCode,
                  user_no: globalData.user.userNo,
                  user_name: globalData.user.name,
                  course_code: globalData.course.courseCode,
                  course_name: globalData.course.name,
                  dep_id: globalData.dept.id,
                  dep_name: globalData.dept.name,
                  dep_code: globalData.dept.code,
                };
                let lockVideoBody = Object.assign({}, fetchHeader);
                var online_video = Object.assign({}, tmpbody);
                online_video = {
                  user_id: globalData.user.id,
                  org_id: globalData.course.orgId,
                  course_id: globalData.course.id,
                  module_id: item.module_id,
                  syllabus_id: item.syllabus_id,
                  activity_id: item.id,
                  upload_id: item.uploads[0].id,
                  reply_id: null,
                  comment_id: null,
                  forum_type: "",
                  action_type: "view",
                  is_teacher: false,
                  is_student: true,
                  ts: new Date().getTime(),
                  user_agent: window.navigator.userAgent,
                  meeting_type: "online_video",
                  master_course_id: globalData.course.id,
                  org_name: globalData.user.orgName,
                  org_code: globalData.user.orgCode,
                  user_no: globalData.user.userNo,
                  user_name: globalData.user.name,
                  course_code: globalData.course.courseCode,
                  course_name: globalData.course.name,
                  dep_id: globalData.dept.id,
                  dep_name: globalData.dept.name,
                  dep_code: globalData.dept.code,
                };
                var online2_video = Object.assign({}, online_video);
                online2_video.action_type = "play";
                online2_video["start_at"] = 0;
                if (uploads.length > 0) {
                  for (const media of uploads) {
                    if (media.type == "video") {
                      duration = media.videos[0]?.duration
                        ? parseInt(media.videos[0]?.duration)
                        : null;
                      online2_video["end_at"] = duration;
                      online2_video["duration"] = duration;
                      lockVideoBody.body = JSON.stringify({
                        start: 1,
                        end: duration,
                      });
                      allURL.push({
                        url: `https://lms.ouchn.cn/api/course/activities-read/${item.id}`,
                        header: lockVideoBody,
                        min: 5,
                        max: 10,
                      });
                      fetchHeader.method = "POST";
                      fetchHeader.body = JSON.stringify(online_video);
                      fetchHeader.referrer =
                        "https://lms.ouchn.cn/course/18068/learning-activity/full-screen";
                      allURL.push({
                        url: `https://lms.ouchn.cn/statistics/api/online-videos`,
                        header: fetchHeader,
                        min: 5,
                        max: 10,
                      });
                      fetchHeader.body = JSON.stringify(online2_video);
                      allURL.push({
                        url: `https://lms.ouchn.cn/statistics/api/online-videos`,
                        header: fetchHeader,
                        min: 5,
                        max: 10,
                      });
                      fetchHeader.referrer =
                        "https://lms.ouchn.cn/course/18068/ng";
                      fetchHeader.body = JSON.stringify(tmpbody);
                      fetchHeader.method = "POST";
                      allURL.push({
                        url: `https://lms.ouchn.cn/statistics/api/user-visits`,
                        header: tmpbody,
                        min: 5,
                        max: 10,
                      });
                      showMsg(
                        `正在刷的课程：${item.title}`,
                        "info",
                        "top",
                        1000
                      );
                      // await ((
                      //   item,
                      //   fetchHeader,
                      //   online_video,
                      //   online2_video,
                      //   lockVideoBody,
                      //   tmpbody
                      // ) => {
                      //   return new Promise((resolve, reject) => {
                      //     setTimeout(() => {
                      //       Swal.fire({
                      //         toast: true,
                      //         position: "top",
                      //         type: "info",
                      //         title: `正在刷的课程：${item.title}`,
                      //         showConfirmButton: false,
                      //         timer: 1000,
                      //       });
                      //       Promise.all([
                      //         ActivitiesRead(item.id, lockVideoBody),
                      //         /* 增加音视频查看次数 */
                      //         OnlineVideo(fetchHeader, online_video),
                      //         OnlineVideo(fetchHeader, online2_video),
                      //         /* 增加课程访问次数 */
                      //         UserVisits(fetchHeader, tmpbody),
                      //       ]);
                      //       resolve();
                      //     }, parseInt(Math.random() * (10 - 5 + 1) + 5));
                      //   });
                      // })(
                      //   item,
                      //   fetchHeader,
                      //   online_video,
                      //   online2_video,
                      //   lockVideoBody,
                      //   tmpbody
                      // );
                      //   Promise.all([
                      //     ActivitiesRead(item.id, lockVideoBody),
                      //     /* 增加音视频查看次数 */
                      //     OnlineVideo(fetchHeader, online_video),
                      //     OnlineVideo(fetchHeader, online2_video),
                      //     /* 增加课程访问次数 */
                      //     UserVisits(fetchHeader, tmpbody),
                      //   ]);
                    } else if (media.type == "audio") {
                      // 待开发
                      duration = media.audio?.duration
                        ? parseInt(media.audio?.duration)
                        : null;
                      online2_video["end_at"] = duration;
                      online2_video["duration"] = duration;
                      online2_video["meeting_type"] = "online_video";
                      lockVideoBody.body = JSON.stringify({
                        start: 1,
                        end: duration,
                        duration: duration,
                      });

                      allURL.push({
                        url: `https://lms.ouchn.cn/api/course/activities-read/${item.id}`,
                        header: lockVideoBody,
                        min: 5,
                        max: 10,
                      });
                      fetchHeader.method = "POST";
                      fetchHeader.body = JSON.stringify(online_video);
                      fetchHeader.referrer =
                        "https://lms.ouchn.cn/course/18068/learning-activity/full-screen";
                      allURL.push({
                        url: `https://lms.ouchn.cn/statistics/api/online-videos`,
                        header: fetchHeader,
                        min: 5,
                        max: 10,
                      });
                      fetchHeader.referrer =
                        "https://lms.ouchn.cn/course/18068/ng";
                      fetchHeader.body = JSON.stringify(tmpbody);
                      fetchHeader.method = "POST";
                      allURL.push({
                        url: `https://lms.ouchn.cn/statistics/api/user-visits`,
                        header: tmpbody,
                        min: 5,
                        max: 10,
                      });
                      showMsg(
                        `正在刷的课程：${item.title}`,
                        "info",
                        "top",
                        1000
                      );
                      // await ((tem, lockVideoBody, online_video, tmpbody) => {
                      //   return new Promise((resolve, reject) => {
                      //     setTimeout(() => {
                      //       Swal.fire({
                      //         toast: true,
                      //         position: "top",
                      //         type: "info",
                      //         title: `正在刷的课程：${item.title}`,
                      //         showConfirmButton: false,
                      //         timer: 1000,
                      //       });
                      //       Promise.all([
                      //         ActivitiesRead(item.id, lockVideoBody),
                      //         /* 增加音视频查看次数 */
                      //         OnlineVideo(fetchHeader, online_video),
                      //         /* 增加课程访问次数 */
                      //         UserVisits(fetchHeader, tmpbody),
                      //       ]);
                      //       resolve();
                      //     }, 3000);
                      //   });
                      // })(item, lockVideoBody, online_video, tmpbody);
                      // Promise.all([
                      //   ActivitiesRead(item.id, lockVideoBody),
                      //   /* 增加音视频查看次数 */
                      //   OnlineVideo(fetchHeader, online_video),
                      //   /* 增加课程访问次数 */
                      //   UserVisits(fetchHeader, tmpbody),
                      // ]);
                    }
                  }
                } else {
                  /* 视频/音频 却没有uploads */
                  showMsg(
                    `视频/音频 却没有uploads\n请联系qq群号682656158`,
                    "error"
                  );
                }
                break;
            }
          }
          console.log(`链接数:${allURL.length}`);
          handleFetchQueue(allURL);
        } else {
          showMsg(`当前页面没有课程？？？\n请联系qq群号682656158`, "error");
        }
      }, 3500);
      /* 解决：文字复制 */
    } else if (/learning-activity\/full-screen\#/.test(href)) {
      let flag;
      let Inter = setInterval(() => {
        $("div.simditor-body.needsclick").each((index, item) => {
          for (let attr in item) {
            if (/jQuery(\d+)/.test(attr)) {
              if (item[attr].events.paste !== null) {
                item[attr].events.paste = null;
              } else {
                flag = 1;
              }
            }
          }
        });
      }, 500);
      if (flag == 1) {
        clearInterval(Inter);
      }
      showMsg(`文本框可复制粘贴`, "success");
    }
  };
  function handleFetchQueue(urls, max = 3, callback) {
    const originUrlCount = urls.length; // 原始url的数量
    const results = [];
    // 1、同时发起max个请求
    for (let i = 0; i < urls.length && i < max; i++) {
      handleOneRequest(urls.shift());
    }
    async function handleOneRequest({
      url: url,
      header: header,
      min: min,
      max: max,
    }) {
      await ((u, h, min, max) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            console.log(`${u}延时${randomNumBoth(min, max)}`);
            results.push(1);
            if (urls.length) {
              handleOneRequest(urls.shift());
            }
            if (results.length === originUrlCount) {
              // 请求全部完成
              // callback(results);
            }
            resolve();
            // fetch(url, header)
            //   .then((res) => {
            //     results.push(res);
            //   })
            //   .catch((err) => {
            //     results.push(err);
            //   })
            //   .finally(() => {
            //     console.log("end", url);
            //     // 2、完成1个请求，队列中随便退出一个，加入下一个
            //     if (urls.length) {
            //       handleOneRequest(urls.shift());
            //     }
            //     if (results.length === originUrlCount) {
            //       // 请求全部完成
            //       callback(results);
            //     }
            //   });
          }, randomNumBoth(min, max));
        });
      })(url, header, min, max);
    }
  }
  function randomNumBoth(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range); //四舍五入
    return num;
  }
  // 学习进度
  function GetLearnProcess(id, header) {
    header.body = null;
    header.method = "GET";
    header.accept = "application/json, text/plain, */*";
    header.referrer = window.location.origin + window.location.pathname;
    return fetch(
      `https://lms.ouchn.cn/api/course/${id}/my-completeness`,
      header
    );
  }

  function isRepeat(arr) {
    var hash = {};
    for (var i in arr) {
      if (hash[arr[i]]) {
        return true;
      }
      hash[arr[i]] = true;
    }
    return false;
  }
  function GetDate() {
    return moment().format("YYYY/MM/DD");
  }

  function GetBrower() {
    let userAgent = navigator.userAgent;
    if (userAgent.indexOf("Chrome") > -1) {
      return "Chrome";
    } else if (userAgent.indexOf("Firefox") > -1) {
      return "Firefox";
    }
    return "Chrome";
  }
  // 获取发帖
  function GetTopics(categoryid, header) {
    return fetch(
      `https://lms.ouchn.cn/api/forum/categories/${categoryid}?conditions=%7B%22topic_sort_by%22:%7B%22predicate%22:%22lastUpdatedDate%22,%22reverse%22:true%7D%7D&fields=id,title,created_by(id,name,nickname,comment),group_id,created_at,updated_at,content,read_replies(reply_id),reply_count,unread_reply_count,like_count,current_user_read,current_user_liked,in_common_category,user_role,has_matched_replies,uploads&page=1&pageSize=50`,
      header
    ).then((res) => res.json());
  }

  function forumScore(activityid, studentid, header) {
    return fetch(
      `https://lms.ouchn.cn/api/activities/${activityid}/students/${studentid}/forum-score`,
      header
    );
  }

  // 发帖
  function PostTopics(header) {
    fetch("https://lms.ouchn.cn/api/topics", header);
  }
  // 获取讨论区分类
  function GetTopicCategories(category_id, header) {
    return fetch(
      `https://lms.ouchn.cn/api/courses/${category_id}/topic-categories?conditions=%7B%22itemsSortBy%22:%7B%22predicate%22:%22created_at%22,%22reverse%22:true%7D%7D&exclude_topic_list=true&include_subtasks=false&page=1&page_size=50`,
      header
    ).then((res) => res.json());
  }
  /* 在线视频 */
  function OnlineVideo(header, body) {
    header.method = "POST";
    header.body = JSON.stringify(body);
    header.referrer =
      "https://lms.ouchn.cn/course/18068/learning-activity/full-screen";
    return fetch("https://lms.ouchn.cn/statistics/api/online-videos", header);
  }

  /* 用户访问统计 */
  function UserVisits(header, body) {
    header.referrer = "https://lms.ouchn.cn/course/18068/ng";
    header.body = JSON.stringify(body);
    header.method = "POST";
    return fetch("https://lms.ouchn.cn/statistics/api/user-visits", header);
  }

  /* 当前视频进度-video  */
  function ActivitiesRead(video_id, header) {
    return fetch(
      `https://lms.ouchn.cn/api/course/activities-read/${video_id}`,
      header
    );
  }
  /* get请求，应该没用 */
  function undefinedReq(id) {
    return fetch(`https://lms.ouchn.cn/api/activities/${id}`, {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "sec-ch-ua":
          '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
      },
      referrer:
        "https://lms.ouchn.cn/course/10000003894/learning-activity/full-screen",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
  }

  function LearnProcessReq(id) {
    return fetch(`https://lms.ouchn.cn/api/course/activities-read/${id}`, {
      headers: {
        accept: "*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/json",
        pragma: "no-cache",
        "sec-ch-ua":
          '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer:
        "https://lms.ouchn.cn/course/10000003894/learning-activity/full-screen",
      body: "{}",
      method: "POST",
      mode: "cors",
      credentials: "include",
    });
  }

  // 学习行为分析
  function statisticsReq(body) {
    return fetch("https://lms.ouchn.cn/statistics/api/learning-activity", {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/json; charset=UTF-8",
        pragma: "no-cache",
        "sec-ch-ua":
          '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer:
        "https://lms.ouchn.cn/course/10000003894/learning-activity/full-screen",
      body: JSON.stringify(body),
      method: "POST",
      mode: "cors",
      credentials: "include",
    });
  }

  function ImportJs(src) {
    let script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.src = src;
    document.documentElement.appendChild(script);
  }

  function showMsg(title, type = "success", position = "top", timer = 2000) {
    Swal.fire({
      toast: true,
      position: position,
      type: type,
      title: title,
      showConfirmButton: false,
      timer: timer,
    });
  }
})();
