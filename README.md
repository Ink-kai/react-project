## gk-studycourse

<details>
<summary>软件功能如下：</summary>
<ul>
<li>2.0.0&emsp;满足油猴1.6.3的功能（秒刷视频、增加学习行为）</li>
<li>&emsp;&emsp;&emsp;&nbsp;增加个人配置</li>
</ul>
</details>

[代码](./gk-studycourse/index.js)

## tmpermonkey

<details>
<summary>新国开大学自动刷视频（刷题不涉及）</summary>
<ul>
<li>1.6.3&emsp;修复学习行为音频未增加的bug</li>
<li>1.6.2&emsp;修复学习行为未增加的bug</li>
<li>1.6.1&emsp;解决上锁视频自动刷异常</li>
<li>1.6&emsp;&emsp;加锁视频自动刷（思政课、形式与政策等）</li>
<li style="list-style-type:none">&emsp;&emsp;&emsp;&nbsp;修界面提示“刷完了”后，1.5秒自动刷新页面，方便查看进度（只有第一次刷课程的才有自动刷新）</li>
<li style="list-style-type:none">&emsp;&emsp;&emsp;&nbsp;修关闭自动发帖</li>
<li style="list-style-type:none">&emsp;&emsp;&emsp;&nbsp;修优化文本框复制粘贴</li>
<li>1.5.1&emsp;修复视频、进度未增加的bug</li>
<li>1.5&emsp;&emsp;增加自动回帖（发过贴则不再发）</li>
<li style="list-style-type:none">&emsp;&emsp;&emsp;&nbsp;修解决提交作业页面文字不能复制。仅限提交作业页面，有个文本编辑器的地方</li>
<li style="list-style-type:none">&emsp;&emsp;&emsp;&nbsp;修兼容Firefox浏览器header</li>
<li>1.4&emsp;&emsp;提供音频、文本刷新。该版本主要是代码重构</li>
<li>1.3.2&emsp;&nbsp;代码优化</li>
<li>1.3&emsp;&emsp;打开课程页面，刷视频，同时增加学习行为的记录访问</li>
<li>1.0&emsp;&emsp;打开课程页面，刷视频</li>
</ul>
</details>

[代码](./tampermonkey/new.js)

<details>
<summary>老国开大学自动刷视频、试题（专题、形考相关内容不涉及）</summary>
<ul>
<li>1.1.1&emsp;视频只需3秒刷</li>
<li>&emsp;&emsp;&emsp;&nbsp;刷题。包括应用、单选、多选，前提是答错题系统会给正确答案，因为自动刷题是保存系统给出的正确答案，再重新用正确答案来答题</li>
<li>&emsp;&emsp;&emsp;&nbsp;刷题满足总分*0.8则不再答题，否则重复刷；形考不能刷，目前没有写跳过形考题的代码，请各位手动处理下！！！</li>
<li>&emsp;&emsp;&emsp;&nbsp;提示下大家，网站不能一直使用该脚本，根据我目前使用的网站看，有些网站会检测脚本，会把你账号封一段时间的</li>
</ul>
</details>

[代码](./tampermonkey/wuhan.js)

<details>
<summary>一体化网站自动刷题（专题、形考没有测试）</summary>
<ul>
<li>1.2&emsp;多选题自动选有问题，F12 打开控制台可见答案</li>
</ul>
</details>

[代码](./tampermonkey/xjskk.open.com.cn.js)