// ==UserScript==
// @name         CF ToolKit
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  CF Shortcut
// @author       Faysal Mahmud
// @match        https://codeforces.com/contest/*
// @match        https://codeforces.com/problemset/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=codeforces.com
// @grant        none
// ==/UserScript==
(function() {
    'use strict';

    function createTimer(contestNumber, problemCode) {
        const cookieKey = `${contestNumber}-${problemCode}-startTime`;
        let time = 0;
        let isRunning = false;
        let interval;
        let startTime;

        function formatTime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        function getTimeDifferenceInSeconds(startTimeString) {
            const start = new Date(startTimeString);
            const now = new Date();
            return Math.floor((now - start) / 1000);
        }

        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        }

        function startStopTimer() {
            if (!isRunning) {
                if (!startTime) {
                    startTime = new Date().toISOString();
                    document.cookie = `${cookieKey}=${startTime}; max-age=604800; path=/`; // Cookie expires in 7 days
                }
                const savedStartTime = getCookie(cookieKey);
                if (savedStartTime) {
                    time = getTimeDifferenceInSeconds(savedStartTime);
                }
                interval = setInterval(() => {
                    time++;
                    updateDisplay();
                }, 1000);
                isRunning = true;
                startStopButton.textContent = 'Stop';
            } else {
                clearInterval(interval);
                isRunning = false;
                startStopButton.textContent = 'Start';
            }
        }

        function updateDisplay() {
            timerDisplay.textContent = formatTime(time);
        }

        const timerContainer = document.createElement('div');
        timerContainer.classList.add('mCnt')
        const timerDisplay = document.createElement('span');
        const startStopButton = document.createElement('button');

        const savedStartTime = getCookie(cookieKey);
        if (savedStartTime) {
            time = getTimeDifferenceInSeconds(savedStartTime);
            startTime = savedStartTime;
        }

        updateDisplay();
        startStopButton.textContent = 'Start';
        startStopButton.onclick = startStopTimer;

        timerContainer.appendChild(timerDisplay);
        timerContainer.appendChild(startStopButton);

        if (getCookie(cookieKey)) {
            startStopTimer()
        }

        return timerContainer;
    }

    function addTimerToTable() {
        let url = window.location.href;
        const regex = /\/(?:problemset\/problem|contest)\/(\d+)(?:\/problem)?\/([A-Z]\d*)/;
        const match = url.match(regex);
        let contestNumber = match[1]
        let problemCode = match[2]
        let table = document.querySelector(".rtable")
        table = table.children[0]
        table.children[table.children.length - 1].children[0].classList.remove('bottom')
        let tr = document.createElement('tr')
        let td = document.createElement('td')
        td.classList.add('left', 'bottom')
        td.appendChild(createTimer(contestNumber, problemCode))
        tr.appendChild(td)
        table.appendChild(tr)
    }

    function addLink() {
        let url = window.location.href;
        let regex = /(\d+)/
        let match = url.match(regex);
        //console.log(match) ;

        let contest = match[1];
        let link = 'https://codeforces.com/contest/' + contest;
        //console.log(link) ;

        let flink = link + '/standings/friends/true';
        let ul = document.querySelector('.second-level-menu-list')
        ul.innerHTML += `<li><a href="${flink}">Frns</a></li>`

        let xhr = new XMLHttpRequest();
        xhr.open('GET', link);
        xhr.onload = () => {
            console.log(xhr.status);
            let doc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
            //console.log(doc)

            let hrfs = doc.querySelectorAll("a[href*='contest/'][href*='/problem']");

            document.head.innerHTML +=
                `<style>
                 .cls{
                     display: inline-block;
                     border: 1px solid black;
                     padding: 0px 10px 0px 10px;
                     text-decoration: none;
                     color: black !important;
                     margin : 3px ;
                     border-radius: 7px 0px 7px 0px;
                     background: white;
                     font-weight : 600 ;
                     }
                .mCnt{
                  display : flex ;
                  align-items : center ;
                  justify-content : space-around ;
                }

                .mCnt span {
                   font-family: 'Trebuchet MS', sans-serif;
                font-size : 1.7rem ;
                }

                .mCnt button {
                  background : none ;
                  outline : none ;
                  border : 1px solid black ;
                  border-radius : 7px 0px 7px 0px ;
                  padding : 3px 15px ;
                  font-weight : 700 ;
                  font-family: 'Trebuchet MS', sans-serif;
                }
             </style>`;

            let table = document.querySelector(".rtable")
            table = table.children[0];
            table.children[table.children.length - 1].children[0].classList.remove('bottom')
            let tr = document.createElement('tr')
            let td = document.createElement('td')
            td.classList.add('left')


            for (let i = 0; i < hrfs.length - 1; i += 2) {
                //console.log(hrfs[i])
                hrfs[i].classList.add('cls')
                let ac = hrfs[i].parentElement.parentElement.classList[0];
                if (ac == 'accepted-problem') {
                    hrfs[i].style.background = '#a7ffe6';
                } else if (ac == 'rejected-problem') {
                    hrfs[i].style.background = '#ffe4e4';
                }
                td.appendChild(hrfs[i])
            }
            tr.appendChild(td)
            table.appendChild(tr)
            addTimerToTable();
        }
        xhr.send()

    }

    addLink();

})();