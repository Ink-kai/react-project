// ==UserScript==
// @name         国开自动刷题、视频（wuhan.ouchn.cn）
// @namespace    http://tampermonkey.net/
// @version      1.1sp1
// @description  国开大学自动完成刷题、刷视频任务
// @description  功能1:视频只需3秒刷
// @description  功能2:刷题。包括应用、单选、多选，前提是答错题系统会给正确答案，因为自动刷题是保存系统给出的正确答案，再重新用正确答案来答题
// @description  刷题满足总分*0.8则不再答题，否则重复刷；形考不能刷，目前没有写跳过形考题的代码，请各位手动处理下！！！
// @description  提示下大家，网站不能一直使用该脚本，根据我目前使用的网站看，有些网站会检测脚本，会把你账号封一段时间的
// @description  如果脚本不适应或者其他问题，可以来q群讨论：682656158
// @license      MIT
// @author       InkCat
// @compatible  chrome,firefox  最好是使用Chrome内核的浏览器
// @match        http://*.ouchn.cn/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ouchn.cn
// @require      http://cdn.bootcss.com/jquery/1.8.3/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/dexie/3.0.4/dexie.min.js
// @grant        none
// ==/UserScript==

'use strict';
(function () {
    let cmid = /cmid=(\d+)/.exec(window.location.search)?.[1] || /cmid=(\d+)/.exec($('a.endtestlink.aalink')?.[0]?.href)?.[1] || /id=(\d+)/.exec(window.location.href)?.[1] || $("form>input[name='cmid']")[0]?.value;
    var db = new Dexie(window.location.host);
    var db_name = 'answer_question';
    // 播放视频
    var video = document?.querySelector('video');
    if (video !== undefined && video !== null) {
        video.onloadedmetadata = function () {
            console.log('视频加载完成，开始播放', video);
            this.volume = 0;
            this.currentTime = this.duration - 3;
        };
        video.addEventListener('ended', function () {
            console.log('------------------结束播放------------------');
            setTimeout(function () {
                NextNode()[0].click();
            }, timeout(5, 10));
        });
    }
    function timeout(max = 5, min = 7) {
        return 1000 * (Math.floor(Math.random() * (max - min) + 1) + min);
    }
    function initDB() {
        var table = {};
        table['answer_question'] = '++id,cmid,attempt,question,answer';
        table['view_page'] = '++id,cmid,url,course';
        db.version(1).stores(table);
    }
    // 当前链接有视频？播放:跳下一链接
    function main() {
        var href = window.location.href;
        if (/course\/view.php\?id=\d+\&sectionid=\d+\&mid=\d+/.test(href)) {
            // 小节页面
            if (window.data !== undefined) {
                // 当前章节所有课程
                console.log('------------------开始检索页面------------------');
                var next_link = NextNode();
                // 下一个链接存在？0不存在
                if (next_link.length < 1) {
                    // 跳转下一个章节
                    var ns = NextSection();
                    ns?.click();
                } else {
                    setTimeout(() => {
                        next_link[0].click();
                    }, timeout());
                }
            }
        } else if (/mod\/quiz\/view.php/.test(href)) {
            // 答题前页面
            var summary_table = [].slice.apply($('table.generaltable.quizattemptsummary tbody>tr'));

            // 2.已有试答记录，分数不达标
            new Promise(function (resolve, reject) {
                // 是否有试答?
                var standard_tag = $('table.generaltable.quizattemptsummary thead>tr>th').eq(-2);
                var standard = standard_tag?.[0]?.getInnerHTML().match(/(?=\/)([0-9]+\.?[0-9]+)|([0-9]+\.?[0-9]+)/gm);

                if (standard_tag.length !== 0 && standard !== undefined && standard !== null) {
                    var result = summary_table.some(row => {
                        return Number($(row).find('td').eq(-2)[0]?.getInnerHTML()) > Number(standard[0] * 0.8);
                    });
                    db.open().then(_ => {
                        db.table('view_page').add({ cmid: window.location.search.match(/(\d+)/)[1], url: window.location.href, course: result });
                    });
                    if (result) {
                        // 分数满足
                        resolve(1);
                    } else {
                        var db_err;
                        db.open().then(data => {
                            data.table(db_name)
                                .filter(function (data) {
                                    return data.cmid === cmid;
                                })
                                .count()
                                .then(c => {
                                    if (c > 0) {
                                        db_err = true;
                                    }
                                });
                        });
                        if (db_err === true) {
                            resolve(2);
                        } else {
                            resolve(0);
                        }
                    }
                } else {
                    resolve(0);
                }
            }).then(flag => {
                console.log(flag);
                // 分数达标
                if (flag === 1) {
                    if (window.localStorage.getItem('course_url') ?? false === true) {
                        window.open(window.localStorage.getItem('course_url'), '_self');
                    } else {
                        console.log('回到课程首页');
                        $('header li.nav-item>a')[0].click();
                    }
                } else if (flag == 0) {
                    console.log('分数不够，重新答题');
                    $("[type='submit']")[0].click();
                } else if (flag == 2) {
                    console.log('没有答案，开始回顾');
                    // 如果有试答记录,通过《回顾》记录答案
                    var view_page = summary_table[0]?.lastElementChild?.firstChild;
                    if (view_page != undefined) {
                        view_page.click();
                    }
                }
            });
        } else if (/mod\/quiz\/attempt.php/.test(href)) {
            // 答题页面
            var all_pro = [];
            var sort_answer;
            db.open().then(db => {
                if (db.tables.some(table => table.name == db_name)) {
                    db.table(db_name)
                        .where({ cmid: cmid })
                        .count()
                        .then(c => {
                            if (c > 0) {
                                var all_question = [].slice.apply($("div[id*='question']:not([class*='description']) div.content"));
                                console.log('已有答案，开始答题');
                                all_question.forEach(q => {
                                    all_pro.push(
                                        new Promise((resolve, reject) => {
                                            var shiti = q.firstChild;
                                            var question = shiti.getElementsByClassName('qtext')[0]?.innerText;
                                            var answers = shiti.getElementsByClassName('answer')?.[0]?.children || $(shiti).find('input:not(:first)');
                                            // 数据匹配
                                            db.table(db_name)
                                                .where('question')
                                                .equalsIgnoreCase(question)
                                                .first()
                                                .then(data => {
                                                    var regex_answer =
                                                        data.answer.substring(data.answer.lastIndexOf('：') + 1, data.answer.length) ||
                                                        /\“(\W+)\”|\：(\W+)/.exec(data.answer)?.[1] ||
                                                        /\“(\W+)\”|\：(\W+)/.exec(data.answer)?.[2] ||
                                                        data.answer.match(/(?<=\.)(\W+)(?=\])/g) ||
                                                        /(?<=\：|\:)(\d+)/.exec(data.answer)?.[1] ||
                                                        /(\W+)/g.exec(data.answer)?.[1] ||
                                                        /(?<=\：|\:)(.*)/.exec(data.answer)?.[1];
                                                    if (data === undefined) {
                                                        reject('没有找到答案');
                                                    } else if ($(answers).find("[type='checkbox']")?.length >= 1) {
                                                        // 不规则答题（多选题）
                                                        Array.from(answers).forEach((a, i) => {
                                                            var text = $(a).find('p')[0]?.innerText;
                                                            regex_answer = regex_answer.replace(/\s+/, '');
                                                            text = text.replace(/\s+/g, '');
                                                            if (regex_answer.includes(text) && $(a).find("[type='checkbox']")?.[0].checked === false) {
                                                                $(a).find("[type='checkbox']")[0]?.click();
                                                            }
                                                        });
                                                    } else if ($(answers).find("[type='radio']")?.length >= 1) {
                                                        // 单选
                                                        Array.from(answers).forEach(a => {
                                                            regex_answer = /(?<=\“)(.*)(?=\”)/.exec(data.answer)[1];
                                                            var form_answer = a.getElementsByTagName('p')[0] || $(a).find('.answernumber+div')[0] || a;
                                                            if (regex_answer === form_answer?.innerText.replace(/\s+/g, '')) {
                                                                // 选择正确答案
                                                                a?.firstChild?.click();
                                                            }
                                                        });
                                                    } else if (regex_answer?.length >= 1) {
                                                        // 不规则答题（应用题）
                                                        Array.from(answers).forEach((a, i) => {
                                                            var form_answer = a;
                                                            sort_answer = Array.from(regex_answer);
                                                            sort_answer.sort();
                                                            // console.log("题目", i + 1, "\t答案：", sort_answer.indexOf(regex_answer[i]) + 1)
                                                            form_answer.setAttribute('value', sort_answer.indexOf(regex_answer[i]) + 1);
                                                        });
                                                    }
                                                    console.log(question, data.answer);
                                                    resolve(question, data.answer);
                                                });
                                        })
                                    );
                                });
                            }
                        });
                } else {
                    console.log('没有存答案哦，我先出去找找');
                    var next = $("[type='submit'][name='next']")?.[0];
                    if (next?.innerText === '下一页') {
                        next.click();
                    } else {
                        $('a.endtestlink.aalink')?.[0].click();
                    }
                }
            });
            setTimeout(_ => {
                Promise.all(all_pro)
                    .then(res => {
                        console.log(res);
                        // 如果存在下一页
                        var next = $("[type='submit'][name='next']")?.[0];
                        if (next?.innerText === '下一页') {
                            next.click();
                        }
                        console.log('答案填写完成', res);
                        $('a.endtestlink.aalink')?.[0].click();
                    })
                    .catch(err => {
                        console.log(err);
                        $('a.endtestlink.aalink')?.[0].click();
                    });
            }, 3000);
            // 确认全部提交页面
        } else if (/mod\/quiz\/summary.php/.test(href)) {
            new Promise(resolve => {
                $("button[type='submit']")[1]?.click();
                resolve(true);
            }).then(res => {
                setTimeout(() => {
                    if ($("div.confirmation-dialogue input[type='button']")?.[0]) {
                        console.log(res, $("div.confirmation-dialogue input[type='button']")[0]);
                        $("div.confirmation-dialogue input[type='button']")[0].click();
                    } else {
                        window.location.reload();
                    }
                }, 1500);
            });
        } else if (/mod\/quiz\/review.php/.test(href)) {
            Array.from($('#page table>tbody>tr')).filter(tr => {
                var fenshu = $('#page table.generaltable>tbody>tr:last')[0]?.innerText?.match(/(\d*\.?\d+)/g)[0];
                var zongfen = $('#page table.generaltable>tbody>tr:last')[0]?.innerText?.match(/(\d*\.?\d+)/g)[1];
                if (fenshu !== undefined && zongfen * 0.8 < fenshu) {
                    console.log('关闭页面');
                    $('.submitbtns a')?.[0]?.click();
                } else {
                    // 记录答案
                    // 正确答案页面
                    new Promise((resolve, reject) => {
                        // 使用Dexie存储答案
                        if (db.tables.length < 1) {
                            initDB();
                        }
                        db.open();
                        // 将数据保存到新创建的对象仓库
                        var all_question = [].slice.apply($("div[id*='question']:not([class*='description']) div.content"));
                        // 单选题
                        all_question.forEach(q => {
                            var daan = q;
                            var question = daan.firstChild.getElementsByClassName('qtext')[0]?.innerText;
                            var answer = daan.lastChild.getElementsByClassName('rightanswer')[0]?.lastChild?.innerText || daan.lastChild.getElementsByClassName('rightanswer')[0]?.innerText.replace(/[\n|\t|\s]+/g, '');
                            if (answer === undefined) {
                                console.log('没有答案！！！');
                                reject('特殊题目，没有答案');
                            }
                            db[db_name].add({ answer: answer, question: question, cmid: cmid, attempt: /attempt=(\d+)/.exec(window.location.search)[1] });
                            resolve(true);
                        });
                        var next = $("[type='submit'][name='next']")?.[0] || $("a[class*='next']")?.[0];
                        if (next?.innerText.includes('下一页')) {
                            next.click();
                        }
                    })
                        .then(res => {
                            if (res == true) {
                                console.log('promise结果：', res);
                                setTimeout(() => {
                                    $('a.mod_quiz-next-nav')[0].click();
                                }, timeout(4, 6));
                            }
                            $('a.mod_quiz-next-nav')?.[0]?.click();
                        })
                        .catch(err => console.log('程序异常，没有找到答案', err));
                }
            });
        } else if (/course\/view.php/.test(href)) {
            // 课程首页 跳转至成绩页面
            $('#actionmenuaction-3')?.[0].parentElement.click();
        } else if (/grade\/report\/overview\/index.php/g.test(href)) {
            // 个人课程主页
            var all_course = $("#region-main table tbody tr:not([class*='emptyrow'])");
            Array.from(all_course).forEach((c, i) => {
                // 分数是否大于80
                var fenshu = /(\d+\.?\d+)/.exec($(c).find('td').eq(1)?.[0].innerText)?.[1] ?? 0;
                if (Number(fenshu).toFixed(2) < 80) {
                    $(c).find('a')?.[0].click();
                }
            });
        } else if (/course\/user.php\?mode=grade\&id=\d+\&user=\d+/.test(href)) {
            window.localStorage.setItem('course_url', window.location.href);
            var table = Array.from($('#region-main table>tbody>tr'));
            table.forEach((e, i) => {
                var standard = $(e).find("td:not([class*='b2b'])+td").eq(-4)[0]?.innerText?.split('–')[1] ?? 0;
                var fenshu = $(e).find("td:not([class*='b2b'])+td").eq(-5)[0]?.innerText ?? 0;
                if (Number(fenshu) ? Number(fenshu) : 0 <= standard * 0.8) {
                    db.open()
                        .then(_ => {
                            var id = $(e)
                                .find('th a')[0]
                                ?.innerText.match(/(?<=id\=?)(\d+)/);
                            db.table('view_page')
                                .where({ cmid: id })
                                .first()
                                .then(data => {
                                    if (data.course || data.course !== undefined) {
                                        return;
                                    } else {
                                        $(e).find('th a')[0]?.click();
                                    }
                                });
                        })
                        .then(_ => {
                            $(e).find('th a')[0]?.click();
                        });
                }
            });
        } else {
            alert("脚本停止了")
            return;
        }
    }
    function NextNode() {
        var regex = /mid=(\d+)/;
        var current_link = regex.exec(window.location.search);
        var course_list = [].slice.apply(document.querySelectorAll('#na .mlist>ul>li'));
        var next_link = course_list.filter(data => {
            return data.getAttribute('i') > current_link[1] && (data.getAttribute('is_com') == 'false' || data.getAttribute('is_com') == '0');
        });
        return next_link;
    }
    function NextSection() {
        var section = $('#page #list .listinfo a');
        var current_section = /sectionid=(\d+)/.exec(window.location.search)[1];
        for (let i = 0; i < section.length; i++) {
            const e = section[i];
            if (e !== undefined && section[i + 1] !== undefined && /sectionid=(\d+)/.exec(section[i + 1])[1] > current_section) {
                return section[i + 1];
            }
        }
    }
    function isExistsSite() {
        if(/wuhan\.ouchn\.cn/.exec(window.location.host)?.length<1){
            alert("脚本可能不适用本页面！！！请联系qq群：682656158")
        }
    }
    setTimeout(_ => {
        initDB();
        isExistsSite()
        main();
    }, timeout(3, 5));
})();
/*
var script = document.createElement("script");
script.src = "https://unpkg.com/dexie@latest/dist/dexie.js";
document.getElementsByTagName('head')[0].appendChild(script);
*/
