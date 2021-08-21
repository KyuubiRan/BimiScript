// ==UserScript==
// @name         哔咪脚本
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  阿巴阿巴
// @author       KyuubiRan
// @include      /https?:\/\/(www\.)?bimiacg2?\.net\/?/
// @icon         https://www.google.com/s2/favicons?domain=bimiacg.net
// @grant        none
// ==/UserScript==

//移除广告
const REMOVE_AD = true
//自动跳转版权番剧
const AUTO_JUMP_ENABLED = true
//自动点赞
const AUTO_LIKE_ENABLED = true
//自动跳转延迟
const AUTO_JUMP_DELAY = 3
//自动点赞延迟
const AUTO_LIKE_DELAY = 60
//每轮点赞次数
const AUTO_LIKE_TIMES = 25

const REG_HOME = /^https?:\/\/(www\.)?bimiacg2?\.net\/?$/
const REG_TYPE = /https?:\/\/(www\.)?bimiacg2?\.net\/type\/?/
const REG_BANGUMI = /https?:\/\/(www\.)?bimiacg2?\.net\/bangumi\/bi\/\d+\/?/
const REG_PLAY = /https?:\/\/(www\.)?bimiacg2?\.net\/bangumi\/\d+\/play\/\d+\/\d+\/?/

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function removeElem(elem) {
    try {
        elem.remove()
    } catch (ignored) { }
}

const AD_ELEM_LIST = ["hbidbox", "HMRichBox", "HMcoupletDivleft", "HMcoupletDivright"]

async function removeAd() {
    if (!REMOVE_AD) return
    let tuiguangElems = document.getElementsByClassName("tuiguang")
    while (tuiguangElems.length !== 0) removeElem(tuiguangElems[0])
    let observer = new MutationObserver(_ => {
        AD_ELEM_LIST.forEach(s => {
            removeElem(document.getElementById(s))
        })
    })
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterDataOldValue: true
    })
}

async function autoJump() {
    if (!AUTO_JUMP_ENABLED) return
    if (document.querySelector("body > section > div.main > div:nth-child(1) > div").textContent.includes("版权限制")) {
        console.log("检测到版权限制番剧，三秒钟后进行跳转。")
        let url = document.URL.replace("bi/", "")
        if (url.endsWith('/')) {
            url += "play/1/1"
        } else {
            url += "/play/1/1"
        }
        await sleep(AUTO_JUMP_DELAY * 1000)
        window.location.replace(url)
    }
}

async function autoLike() {
    if (!AUTO_LIKE_ENABLED) return
    let elem = document.querySelector("body > section > div.tb.player > div.tab-a.player-box.area > div.player-info.clear > div.player-num > a.digg_link.Up")
    let times = 0;
    while (1) {
        console.log("自动点赞进行中，当前轮数:" + ++times)
        try {
            for (var i = 0; i < AUTO_LIKE_TIMES; ++i) { elem.click() }
        } catch (ignored) { }
        await sleep(AUTO_LIKE_DELAY * 1000)
    }
}

(async function start() {
    removeAd()
    if (REG_BANGUMI.test(document.URL)) autoJump()
    if (REG_PLAY.test(document.URL)) autoLike()
})()