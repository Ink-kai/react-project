'use strict'
class gkStudyCourse {
    constructor(axios,JQuery, Swal, ...args) {
        if (!gkStudyCourse.instance) {
            gkStudyCourse.instance = this
        }
        this.globalData = args[0]?.globalData || []
        this.axios=axios
        this.$ = JQuery
        this.Swal = Swal
        this.location = window.location

        this.allmodule = []
        this.moduleids = []
        this.page_courseid = -1
        this.all_activities = []
        this.Allexams = []
        this.header = {
            headers: {
                accept: '*/*',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                pragma: 'no-cache',
                'sec-ch-ua':
                    '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'x-requested-with': 'XMLHttpRequest',
            },
            referrer: 'https://lms.ouchn.cn/course/14227/learning-activity/full-screen',
            referrerPolicy: 'strict-origin-when-cross-origin',
            body: '{}',
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
        };
        return gkStudyCourse.instance
    }
    getUrlParams() {
        let urlStr = window.location.search.split('?')[1]
        const urlSearchParams = new URLSearchParams(urlStr)
        const result = Object.fromEntries(urlSearchParams.entries())
        return result
    }
    // 课程页面
    async DisposeCoursePage() {
        if (this.globalData.length === 0) {
            this.Show("没有找到账号信息。" + this.getContactQQ())
            return
        }
        if (location.protocol.includes('https') == false) {
            this.Show('网站没有https协议，请注意安全', 'warning');
        }
        let allmodule = [], n = 0
        this.page_courseid = /(\d+)/.exec(window.location.href)[1]
        const ds = setInterval(async () => {
            n += 1
            if (n === 10) {
                clearInterval(ds)
                this.Show("找不到课程信息。", "info")
            }
            allmodule = this.$(".module-list.gtm-category.open-university .module.ng-scope")
            if (allmodule ?? "" !== "") {
                clearInterval(ds)
                if (allmodule.length === 0 || this.page_courseid === -1) {
                    this.Show("当前页面没有找到课程。" + this.getContactQQ())
                }
                Array.from(allmodule).forEach(item => {
                    var moduleid = /(\d)+/.exec(item.getAttribute('id'))[0];
                    this.moduleids.push(moduleid);
                });
                this.all_activities = await this.getAllCourse()

                let learning_activities = []
                learning_activities = this.all_activities.learning_activities
                if (learning_activities.length > 0) {
                    learning_activities.forEach(item => {
                        /*
                        页面类型：forum', 'page', 'material', 'online_video', 'questionnaire',"homework","web_link"
                        有英语底子或者网上查就知道
                        */
                        switch (item.type) {
                            /* 页面 */
                            case 'page':
                            case 'forum':
                            case 'web_link':
                            case 'homework':
                                var body = {
                                    org_id: this.globalData.course.orgId,
                                    user_id: this.globalData.user.id,
                                    course_id: this.globalData.course.id,
                                    enrollment_role: 'student',
                                    is_teacher: false,
                                    activity_id: item.id,
                                    activity_type: 'page',
                                    activity_name: null,
                                    module: null,
                                    action: 'open',
                                    ts: new Date().getTime(),
                                    user_agent: window.navigator.userAgent,
                                    mode: 'normal',
                                    channel: 'web',
                                    target_info: {},
                                    master_course_id: this.globalData.course.id,
                                    org_name: this.globalData.user.orgName,
                                    org_code: this.globalData.user.orgCode,
                                    user_no: this.globalData.user.userNo,
                                    user_name: this.globalData.user.name,
                                    course_code: this.globalData.course.courseCode,
                                    course_name: this.globalData.course.name,
                                    dep_id: this.globalData.dept.id,
                                    dep_name: this.globalData.dept.name,
                                    dep_code: this.globalData.dept.code,
                                };
                                Promise.all([
                                    this.statisticsReq(body),
                                    this.undefinedReq(item.id),
                                    this.learnProcessReq(item.id),
                                ]);
                                break;
                            case 'online_video':
                                var uploads = item.uploads;
                                var duration;
                                var tmpbody = {
                                    user_id: this.globalData.user.id,
                                    org_id: this.globalData.course.orgId,
                                    course_id: this.globalData.course.id,
                                    visit_duration: duration,
                                    is_teacher: false,
                                    browser: this.getBrower(),
                                    user_agent: window.navigator.userAgent,
                                    master_course_id: this.globalData.course.id,
                                    org_name: this.globalData.user.orgName,
                                    org_code: this.globalData.user.orgCode,
                                    user_no: this.globalData.user.userNo,
                                    user_name: this.globalData.user.name,
                                    course_code:
                                        this.globalData.course.courseCode,
                                    course_name: this.globalData.course.name,
                                    dep_id: this.globalData.dept.id,
                                    dep_name: this.globalData.dept.name,
                                    dep_code: this.globalData.dept.code,
                                };
                                let lockVideoBody = Object.assign(
                                    {},
                                    this.header
                                );
                                var online_video = Object.assign(
                                    {},
                                    tmpbody
                                );
                                online_video = {
                                    user_id: this.globalData.user.id,
                                    org_id: this.globalData.course.orgId,
                                    course_id: this.globalData.course.id,
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
                                    master_course_id: this.globalData.course.id,
                                    org_name: this.globalData.user.orgName,
                                    org_code: this.globalData.user.orgCode,
                                    user_no: this.globalData.user.userNo,
                                    user_name: this.globalData.user.name,
                                    course_code:
                                        this.globalData.course.courseCode,
                                    course_name: this.globalData.course.name,
                                    dep_id: this.globalData.dept.id,
                                    dep_name: this.globalData.dept.name,
                                    dep_code: this.globalData.dept.code,
                                };
                                var online2_video = Object.assign({}, online_video)
                                online2_video.action_type = 'play';
                                online2_video["start_at"] = 0;
                                if (uploads.length > 0) {
                                    uploads.forEach((media, i) => {
                                        if (media.type == 'video') {
                                            duration = media.videos[0]?.duration ? parseInt(media.videos[0]?.duration) : null;
                                            online2_video["end_at"] = duration;
                                            online2_video["duration"] = duration;
                                            lockVideoBody.body = JSON.stringify({
                                                start: 1,
                                                end: duration,
                                            });
                                            Promise.all([
                                                this.activitiesRead(
                                                    item.id,
                                                    lockVideoBody
                                                ),
                                                /* 增加音视频查看次数 */
                                                this.onlineVideo(
                                                    this.header,
                                                    online_video
                                                ),
                                                this.onlineVideo(
                                                    this.header,
                                                    online2_video
                                                ),
                                                /* 增加课程访问次数 */
                                                this.userVisits(this.header, tmpbody),
                                            ]);

                                        } else if (media.type == 'audio') {
                                            duration = media.audio?.duration ? parseInt(media.audio?.duration) : null;
                                            online2_video["end_at"] = duration;
                                            online2_video["duration"] = duration;
                                            online2_video["meeting_type"] = "online_video";
                                            lockVideoBody.body = JSON.stringify({
                                                start: 1,
                                                end: duration,
                                                duration: duration,
                                            });
                                            Promise.all([
                                                this.activitiesRead(
                                                    item.id,
                                                    lockVideoBody
                                                ),
                                                /* 增加音视频查看次数 */
                                                this.onlineVideo(
                                                    this.header,
                                                    online_video
                                                ),
                                                /* 增加课程访问次数 */
                                                this.userVisits(this.header, tmpbody),
                                            ]);
                                        }
                                    });
                                } else {
                                    /* 视频/音频 却没有uploads */
                                }
                                break;
                        }
                        // 发帖功能
                        if (1 == 0) {
                            let category_id = /(\d+)/.exec(
                                $("div[data-label='讨论']>a")[0]?.href
                            )[0];
                            if (category_id !== null || category_id !== undefined) {
                                this.GetTopicCategories(category_id, header1).then(res => {
                                    // 查询本人是否参与发帖
                                    if (res.total > 0) {
                                        if (res.topics !== null || res.topics !== undefined) {
                                            var topic_categories = res.topic_categories;
                                            topic_categories.forEach((item, index) => {
                                                let id = item.id;
                                                this.GetTopics(id, header1).then(Topicres => {
                                                    let ExistsMyTopic = Topicres.result.topics;
                                                    ExistsMyTopic = ExistsMyTopic.filter(
                                                        item =>
                                                            item.created_by.id ==
                                                            this.globalData.user.id
                                                    );
                                                    // 发过贴则不再发
                                                    if (ExistsMyTopic.length === 0) {
                                                        // 帖子/主贴 目前来看就是一个东西
                                                        let topic_count = item.topic_count,
                                                            activity_id = item.activity_id;
                                                        let topic_header = Object.assign(
                                                            {},
                                                            header1
                                                        );
                                                        /* 发帖内容 */
                                                        topic_header.body = `{\"title\":\"好好学习\",\"content\":\"<p>天天向上</p>\",\"uploads\":[],\"category_id\":${id}}`;
                                                        topic_header.method = 'POST';
                                                        let body = {
                                                            org_id: this.globalData.course.orgId,
                                                            user_id: this.globalData.user.id,
                                                            course_id: this.globalData.course.id,
                                                            enrollment_role: 'student',
                                                            is_teacher: false,
                                                            activity_id: id,
                                                            activity_type: 'forum',
                                                            activity_name: null,
                                                            module: null,
                                                            action: 'create_topic',
                                                            ts: new Date().getTime(),
                                                            user_agent:
                                                                window.navigator.userAgent,
                                                            mode: 'normal',
                                                            channel: 'web',
                                                            target_info: {},
                                                            master_course_id:
                                                                $('#masterCourseId').val(),
                                                            topic_name: '好好学习',
                                                            org_name: this.globalData.user.orgName,
                                                            org_code: this.globalData.user.orgCode,
                                                            user_no: this.globalData.user.userNo,
                                                            user_name: this.globalData.user.name,
                                                            course_code:
                                                                this.globalData.course.courseCode,
                                                            course_name: this.globalData.course.name,
                                                            dep_id: this.globalData.dept.id,
                                                            dep_name: this.globalData.dept.name,
                                                            dep_code: this.globalData.dept.code,
                                                        };
                                                        this.statisticsReq(body);
                                                        this.PostTopics(topic_header);
                                                        //undefinedCategory(id,header1)
                                                        this.forumScore(
                                                            activity_id,
                                                            this.globalData.user.id,
                                                            header1
                                                        );
                                                    } else {
                                                        this.Show(
                                                            item.title + ' 已发过贴则不再发',
                                                            'info',
                                                            1000,
                                                            'top-end',
                                                        );
                                                    }
                                                });
                                            });
                                        } else {
                                            this.Show('该课程没有讨论区。已跳过', 'info', 500);
                                        }
                                    }
                                });
                            } else {
                                this.Show('没有找到讨论区。\n请联系qq群号682656158', 'error');
                            }
                        }

                    });
                } else {
                    this.Show("请求课程数据失败。" + this.getContactQQ())
                }
            }
            this.Show("刷完了")
        }, 100)

    }
    // 粘贴复制
    ResolvePaste() {
        let flag;
        let Inter = setInterval(() => {
            $('div.simditor-body.needsclick').each((index, item) => {
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
        this.Show(`文本框可复制粘贴`, 'success');
    }
    // 自动答题
    Automaicanswer(){
        var question_content=this.$("ol.subjects-jit-display>li:not(:first)")
        this.$.each(question_content,function(i,item) {
            this.$(item).find(".pre-wrap.subject-description.simditor-viewer.mathjax-process")
        })
    }

    async getAllCourse() {
        let header = Object.assign({}, this.header);
        delete header.headers['x-requested-with'];
        delete header.body;
        header.method = 'GET';
        header.accept = 'application/json, text/plain, */*';
        header.referrer = `https://lms.ouchn.cn/course/${this.page_courseid}/ng`;
        let result = await fetch(`https://lms.ouchn.cn/api/course/${this.page_courseid}/all-activities?module_ids=[${this.moduleids}]&activity_types=learning_activities,exams,classrooms,live_records,rollcalls&no-loading-animation=true`, header)
        result = await result.json()
        return result
    }
    /* 当前视频进度-video  */
    activitiesRead(video_id, header) {
        fetch(`https://lms.ouchn.cn/api/course/activities-read/${video_id}`, header);
    }
    /* 在线视频 */
    onlineVideo(header, body) {
        header.method = 'POST';
        header.body = JSON.stringify(body);
        header.referrer = 'https://lms.ouchn.cn/course/18068/learning-activity/full-screen';
        fetch('https://lms.ouchn.cn/statistics/api/online-videos', header);
    }
    /* 用户访问统计 */
    userVisits(header, body) {
        header.referrer = 'https://lms.ouchn.cn/course/18068/ng';
        header.body = JSON.stringify(body);
        header.method = 'POST';
        fetch('https://lms.ouchn.cn/statistics/api/user-visits', header);
    }
    // 学习行为分析
    statisticsReq(body) {
        fetch('https://lms.ouchn.cn/statistics/api/learning-activity', {
            headers: {
                accept: 'application/json, text/javascript, */*; q=0.01',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'cache-control': 'no-cache',
                'content-type': 'application/json; charset=UTF-8',
                pragma: 'no-cache',
                'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'x-requested-with': 'XMLHttpRequest',
            },
            referrer: 'https://lms.ouchn.cn/course/10000003894/learning-activity/full-screen',
            body: JSON.stringify(body),
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
        });
    }
    // 发帖
    postTopics(header) {
        fetch('https://lms.ouchn.cn/api/topics', header);
    }
    forumScore(activityid, studentid, header) {
        fetch(
            `https://lms.ouchn.cn/api/activities/${activityid}/students/${studentid}/forum-score`,
            header
        );
    }
    /* get请求，应该没用 */
    undefinedReq(id) {
        fetch(`https://lms.ouchn.cn/api/activities/${id}`, {
            headers: {
                accept: 'application/json, text/plain, */*',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'cache-control': 'no-cache',
                pragma: 'no-cache',
                'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
            },
            referrer: 'https://lms.ouchn.cn/course/10000003894/learning-activity/full-screen',
            body: null,
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
        });
    }
    learnProcessReq(id) {
        fetch(`https://lms.ouchn.cn/api/course/activities-read/${id}`, {
            headers: {
                accept: '*/*',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                pragma: 'no-cache',
                'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'x-requested-with': 'XMLHttpRequest',
            },
            referrer: 'https://lms.ouchn.cn/course/10000003894/learning-activity/full-screen',
            body: '{}',
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
        });
    }
    // 获取发帖
    getTopics(categoryid, header) {
        fetch(
            `https://lms.ouchn.cn/api/forum/categories/${categoryid}?conditions=%7B%22topic_sort_by%22:%7B%22predicate%22:%22lastUpdatedDate%22,%22reverse%22:true%7D%7D&fields=id,title,created_by(id,name,nickname,comment),group_id,created_at,updated_at,content,read_replies(reply_id),reply_count,unread_reply_count,like_count,current_user_read,current_user_liked,in_common_category,user_role,has_matched_replies,uploads&page=1&pageSize=50`,
            header
        ).then(res => res.json());
    }
    // 获取讨论区分类
    getTopicCategories(category_id, header) {
        fetch(
            `https://lms.ouchn.cn/api/courses/${category_id}/topic-categories?conditions=%7B%22itemsSortBy%22:%7B%22predicate%22:%22created_at%22,%22reverse%22:true%7D%7D&exclude_topic_list=true&include_subtasks=false&page=1&page_size=50`,
            header
        ).then(res => res.json());
    }
    getAllexams() {
        fetch("https://lms.ouchn.cn/api/exams/70000099697/distribute", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "zh-CN",
                "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Chromium\";v=\"106\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin"
            },
            "referrer": "https://lms.ouchn.cn/exam/70000099697/subjects",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        }).then(res => res.json).then(async (res) => {
            this.Allexams = await res
        })
    }
    getBrower() {
        let userAgent = navigator.userAgent;
        if (userAgent.indexOf('Chrome') > -1) {
            return 'Chrome';
        } else if (userAgent.indexOf('Firefox') > -1) {
            return 'Firefox';
        }
        return 'Chrome';
    }
    getContactQQ() {
        return "qq群号：682656158"
    }
    // 消息提示
    Show(title = "没有写提示信息", type = "success", timer = 3000, position = "top") {
        let Toast = this.Swal.mixin({
            toast: true,
            position: position || 'top-end',
            showConfirmButton: false,
            timerProgressBar: true,
            timer: timer || 3000
        })
        Toast.fire({ type, title })
    }
}
module.exports = gkStudyCourse;