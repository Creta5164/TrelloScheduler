/////////////////////////////////////////////////////////////////
//      Copyright 2017 CREFFECT team All rights reserved.
//       Trello scheduler by Creta (creta5164@gmail.com)
/////////////////////////////////////////////////////////////////

const schedulerBoardName = "TrelloScheduler";    //Trello
const days  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const rdays = days.reverse();
let loginState;                                  //로그인 상태 (bool)
let programLoaded;                               //프로그램이 로드 된 상태 (bool)
let firstCreated;                                //최초로 보드가 생성된 경우의 상태 (bool)
let schedulerBoardData;                          //Trello 스케줄러가 생성한 보드의 데이터 (Object)
let schedulerBoardList;                          //Trello 스케줄러의 리스트 목록 (Array > Object)

let requestCall;                                 
let loadState;                                   

//주 진입부입니다.
function init() {
    ShowCommandLineAlert();

    loginState = false;
    programLoaded = false;
    firstCreated = false;

    if (window.location.hash.indexOf("token=") != -1 &&
        window.location.hash.split("token=")[1].indexOf("token") == -1)
        loginTrello();

    updateLoginElements();
}

//로그인 상태를 확인하고, 표시할 것과 표시되지 말아야 할 것을 업데이트합니다.
function updateLoginElements() {
    var i, list = document.getElementsByClassName("logIn");
    for (i = 0; i < list.length; i++)
        list[i].style.display = loginState ? "" : "none";

    list = document.getElementsByClassName("logOut");
    for (i = 0; i < list.length; i++)
        list[i].style.display = !loginState ? "" : "none";

    document.body.style.overflow = loginState ? "hidden" : "auto";
    if (loginState) {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
}

//Trello에 로그인 요청을 보냅니다.
function loginTrello() {
    Trello.authorize({
        type: 'redirect',
        name: 'Trello 스케줄러',
        scope: {
            read: 'true',
            write: 'true'
        },
        expiration: 'never',
        success: Trello_LoginSuccess,
        error: Trello_LoginFail
    });
}

//Trello가 로그인을 시도했을 때 호출합니다.
function onAuthorize() {
    loginState = Trello.authorized();
    updateLoginElements();

    if (loginState && !programLoaded) loadProgram(0);
}

//Trello에 로그아웃 요청을 보냅니다.
function logoutTrello() {
    Trello.deauthorize();
    onAuthorize();
    programLoaded = false;
    window.location.reload();
}

//Trello에 로그인이 성공했을 때 호출됩니다.
function Trello_LoginSuccess() {
    loginState = true;
    updateLoginElements();
    loadProgram(0);
}

//Trello에 로그인이 실패됐을 때 호출됩니다.
function Trello_LoginFail() {
    alert("계정 연동에 실패했습니다.");
}

//Trello 스케줄러를 시작합니다.
function loadProgram(steps, state) {
    if (programLoaded) return;

    document.getElementById("loadingState").innerText = "준비하고 있습니다. 잠시만 기다려주세요...";

    //document.getElementById("titleFade").style.background = "rgba(0, 153, 255, 1)";

    loadState = steps;
    requestCall = null;

    switch (steps) {
        default:
            LoadFailed();
            return;
            
        case 0://보드를 찾습니다.

            document.getElementById("loadingState").innerText = "Trello 스케줄러 보드를 확인하는 중...";

            Trello.get("/members/me/boards/",
                CheckSchedulerBoardExists,
                LoadFailed
            );

            return;
            
        case 1://보드 안의 리스트가 정상인지 확인합니다.

            document.getElementById("loadingState").innerText = "보드의 리스트를 확인하는 중...";

            Trello.get("/boards/" + schedulerBoardData.id + "/lists",
                CheckSchedulerBoardStatus,
                LoadFailed
            );

            return;

        case 2://보드의 리스트를 모두 지웁니다.

            RunLoadRequest(schedulerBoardList.length,
                "리스트를 초기화하는 중...",
                IRemoveLists,
                3
            );
            
            return;

        case 3://보드에 요일별로 리스트를 추가합니다.

            RunLoadRequest(rdays.length,
                "요일별 리스트를 추가하는 중...",
                ICreateLists,
                4
            );
            
            return;

        case 4://프로그램을 준비합니다.

            document.getElementById("loadingState").innerText = "로딩 완료!";
            document.getElementById("appTitle").style.opacity = 0;

            return;
    }

    //finish a loading content
    programLoaded = true;
}

/*
 * 보드를 새로 만들 지 결정합니다.
 * 이미 있는 경우, 해당 보드 데이터를 가져옵니다.
 */
function CheckSchedulerBoardExists(list) {
    if (programLoaded) return;
    schedulerBoardData = null;

    document.getElementById("loadingState").innerText = "Trello 스케줄러 보드를 찾는 중...";

    for (var i = 0, len = list.length; i < len; i++)
        if (list[i].name == schedulerBoardName) {
            schedulerBoardData = list[i];
            loadProgram(1, firstCreated ? "new" : null);
            return;
        }

    document.getElementById("loadingState").innerText = "Trello 스케줄러 보드를 생성하는 중...";

    firstCreated = true;
    Trello.rest('POST', 'boards', {
        name: schedulerBoardName,
        desc: "Trello 스케줄러가 사용하는 보드입니다, 특별한 일이 아니라면 삭제하거나 편집하지 마세요!"
    },
        function (result) { loadProgram(0); },
        LoadFailed
    );
}

//보드의 리스트에 문제가 없는 지 확인합니다.
function CheckSchedulerBoardStatus(list) {
    if (programLoaded) return;
    schedulerBoardList = list;

    if (schedulerBoardList.length == 0) {
        loadProgram(2);
        return;
    }

    var curruption;
    for (var j, i = 0; i < days.length; i++) {
        curruption = true;

        for (j = 0; j < schedulerBoardList.length; j++) {
            if (schedulerBoardList[j].name != days[i]) continue;
            else {
                curruption = false;
                break;
            }
        }

        if (curruption) {
            loadProgram(2);
            return;
        }
    }

    loadProgram(4);
}

//스케줄러의 보드를 하나씩 순서대로 제거합니다.
function IRemoveLists(index) {

    //사용하는 데 필요한 요일의 리스트가 이미 있으면 제거하지 않음.
    for (var i = 0; i < rdays.length; i++)
        if (rdays[i] == schedulerBoardList[index].name) {
            RunLoadAsyncResponse();
            return;
        }

    Trello.put("/lists/" + schedulerBoardList[index].id + "/closed?value=true", RunLoadAsyncResponse, LoadFailed);
}

//스케줄러의 보드를 하나씩 순서대로 추가합니다.
function ICreateLists(index) {

    //이미 해당 요일의 카드가 존재하면 추가하지 않고 진행.
    for (var i = 0; i < schedulerBoardList.length; i++)
        if (schedulerBoardList[i].name == rdays[index]) {
            RunLoadAsyncResponse();
            return;
        }
    Trello.post("/lists?name=" + rdays[index] + "&idBoard=" + schedulerBoardData.id, RunLoadAsyncResponse, LoadFailed);
}

//동기 작업을 시작합니다.
function RunLoadRequest(limit, text, callAsyncFunction, finishFunction) {

    if (limit == null || text == null || callAsyncFunction == null ||
        finishFunction == null || programLoaded) return;
    
    requestCall = {
        "limit": limit,
        "text": text,
        "call": callAsyncFunction,
        "finish": finishFunction,
        "async": 0
    };

    document.getElementById("loadingState").innerText = text + "(0 / " + requestCall.limit + ")";

    callAsyncFunction(0);
}

//프로그램 로드를 위한 동기 작업을 처리합니다.
function RunLoadAsyncResponse() {
    if (++requestCall.async >= requestCall.limit) {

        requestCall.async = requestCall.limit;

        if ({}.toString.call(requestCall.finish) === '[object Function]')
            setTimeout(requestCall.finishFunction, 500);
        else
            setTimeout(loadProgram, 500, requestCall.finish);
    } else 
        requestCall.call(requestCall.async);

    document.getElementById("loadingState").innerText = requestCall.text + "(" + requestCall.async + " / " + requestCall.limit + ")";
}

//Trello에 요청이 실패됐을 때 호출됩니다.
function LoadFailed() {
    programLoaded = false;
    alert("통신하는 도중, 오류가 발생했습니다.");
    logoutTrello();
    window.location.reload();
}

function ShowCommandLineAlert() {
    if ((/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) ||
        /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor))) {
        console.log("%c개발자 외 출입금지", "font-family:'spoqa han sans'; font-size:40pt; color:red;");

        console.log("%c잘 모르는 문자(텍스트, 스크립트 등)를 이곳에 붙여넣지 마세요.\nTrello 계정이 해커에게 악용될 수 있습니다!", "font-family:'spoqa han sans'; font-size:18pt; color:orange");
    } else {
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n" +
            "@@@@@@@@@@@@@@@@@@개발자 외 출입금지@@@@@@@@@@@@@@@@@@@\n" +
            "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n" +
            "@@                                                  @@\n" +
            "@@  잘 모르는 문자(텍스트, 스크립트 등)를              @@\n" +
            "@@  이곳에 붙여넣지 마세요.                           @@\n" +
            "@@                                                  @@\n" +
            "@@  Trello 계정이 해커에게 악용될 수 있습니다!         @@\n" +
            "@@                                                  @@\n" +
            "@@  > _                                             @@\n" +
            "@@                                                  @@\n" +
            "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n"
        );
    }
}