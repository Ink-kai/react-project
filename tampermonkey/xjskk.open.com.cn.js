// ==UserScript==
// @name         国开xjskk.open.com.cn网站刷题
// @namespace    http://tampermonkey.net/
// @version      1.2
// @license      MIT
// @description  xjskk.open.com.cn网站自动答题
// @description  操作如下：1.打开答题页面，若答题完成会有弹窗提示
// @author       Ink
// @compatible  chrome,firefox  最好是使用Chrome内核的浏览器
// @match        https://xjskk.open.com.cn/stuspace/
// @icon         https://icons.duckduckgo.com/ip2/vuejs.org.ico
// @grant        none
// ==/UserScript==
(function () {
    'use strict';
    var result = {}, body = {}
    var info;
    // xjskk.open.com.cn网站题目信息接口
    const examine = /(?<=homeworkId\=)(\d+)/.exec(window.location.href)[1]
    var Bearer = /(?<=XSKJ\-ticket\=)(\S+)(?=;)/.exec(document.cookie)[1]
    const times = /(?<=times\=)(\d+)/.exec(window.location.href)[1]
    fetch(`https://xjskk.open.com.cn/api/student/student-space-service/testExam/goDoExamine?examineId=${examine}&times=${times}&imgCode=`, {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "authorization": `Bearer ${Bearer}`,
            "cache-control": "no-cache",
            "open-student-space-profile": "%7BproductId%3A6,studentId%3A251760%7D",
            "pragma": "no-cache",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\", \"Google Chrome\";v=\"102\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
        "referrer": "https://xjskk.open.com.cn/stuspace/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    }).then(data => data.json()).then(res => {
        if (result === undefined || result === null) {
            reject("请求api错误，请联系Ink")
        } else {
            result = res.content.answerResult
            info = JSON.parse(result.rightAnswer)
            resolve(true)
        }
    }).then(_ => {
        function GetAnswer(question) {
            return info.Items.find(e => { if (e.I2 === question) { return e } })
        }
        function rightAnswer() {
            info.Items.forEach(e => {
                if (/S6\-8|S6/.test(e.I30)) {
                    console.log("题目：", e.I2, "\n答案：", e.I6)
                } else if (/S1|S2|S3/.test(e.I30)) {
                    let tmp = e.I6.filter((d, i) => { if (e.I7.indexOf(String(i)) !== -1) { return d } })
                    console.log("题目：", e.I2, "\n答案：", tmp)
                }
            })
        }
    })
    if (/xjskk\.open\.com\.cn/.test(window.location.host) && /homework/.test(window.location.href)) {
        new Promise((resolve, reject) => {
            Array.from($("[id*='parent']")).forEach(e => {
                // 单选题
                Array.from($(e).find("[id*='children']")).forEach((t, i) => {
                    var question = $(t).find("[class*='children-value-class']")[0].innerText
                    var answer = GetAnswer(question)
                    if (/S1/.test(e.id)) {
                        // console.log(Array.from($(t).find("[class*='el-radio-group'] div:not([class*='clearfix'])")))
                        Array.from($(t).find("[class*='el-radio-group'] div:not([class*='clearfix'])")).forEach((radio, i) => {
                            // console.log(radio, i, answer.I7[0], i === answer.I7[0])
                            if (i === Number(answer.I7[0])) {
                                radio.children[0].click()
                            }
                        })
                    } else if (/S2/.test(e.id)) {
                        // 多选题
                        Array.from($(t).find(`label:not([class*='is-checked']) input[type='checkbox']`)).forEach((checkbox, i) => {
                            if (answer.I7.indexOf(String(checkbox.value)) !== -1) {
                                // console.log(answer.I7, checkbox, answer.I7.indexOf(String(checkbox.value)))
                                setTimeout(() => {
                                    checkbox.click()
                                }, 100 * i);
                            }
                        })
                    } else if (/S3/.test(e.id)) {
                        // 判断题
                        Array.from($(t).find("[class*='el-radio-group'] div")).forEach((radio, i) => {
                            if (answer.I7.indexOf(i)) {
                                radio.children[0].click()
                            }
                        })
                    } else if (/S6-8/.test(e.id)) {
                        // 名词解释
                        $(t).find("[class*='virtualInput'] p")[0].innerHTML = answer.I6
                    } else if (/S6/.test(e.id)) {
                        // 问答题
                        $(t).find("[class*='virtualInput'] p")[0].innerHTML = answer.I6
                    }
                })
            })
            resolve(0)
        }).then(_ => {
            alert("答题完成。请手动提交（打开F12控制台，里面有详细答案）")
            rightAnswer()
        })
    } else {
        alert("请转到答题页面或者联系q群682656158")
    }
})()