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
    console.log("what");
    loginState = false;
    programLoaded = false;
    firstCreated = false;

    if (window.location.hash.includes("#token=") &&
        !window.location.hash.split("#token=")[1].includes("#token"))
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

    document.getElementById("titleFade").style.background = "rgba(0, 153, 255, 1);";

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
    console.log(index, schedulerBoardList[index]);
    Trello.put("/lists/" + schedulerBoardList[index].id + "/closed?value=true", RunLoadAsyncResponse, LoadFailed);
}

//스케줄러의 보드를 하나씩 순서대로 추가합니다.
function ICreateLists(index) {
    Trello.post("/lists?name=" + rdays[index] + "&idBoard=" + schedulerBoardData.id, RunLoadAsyncResponse, LoadFailed);
}

//프로그램 로드를 위한 작업을 실행합니다.
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

    document.getElementById("loadingState").innerText = text + "(" + requestCall.async + " / " + requestCall.limit + ")";

    callAsyncFunction(0);

}

//프로그램 로드를 위한 처리 완료 함수입니다.
function RunLoadAsyncResponse() {
    if (++requestCall.async >= requestCall.limit) {
        if (getType.toString.call(requestCall.finish) === '[object Function]')
            setTimeout(requestCall.finishFunction, 500);
        else
            setTimeout(loadProgram, 500, requestCall.finish);

        requestCall.limit = requestCall.text =
            requestCall.call = requestCall.async = null;

    } else 
        requestCall.call(requestCall.async);

    document.getElementById("loadingState").innerText = text + "(" + requestCall.async + " / " + requestCall.limit + ")";
}

//로딩 상태를 업데이트합니다.
function RunAsyncLoad() {
    if (requestCall == null || programLoaded) return;

    if (++requestCall[0] >= requestCall[1]) { 
        if (getType.toString.call(requestCall[3]) === '[object Function]')
            setTimeout(requestCall[3], 500);
        else
            setTimeout(loadProgram, 500, requestCall[3]);
    }

    document.getElementById("loadingState").innerText = requestCall[2] + "(" + requestCall[0] + " / " + requestCall[1] + ")";
}

//Trello에 요청이 실패됐을 때 호출됩니다.
function LoadFailed() {
    programLoaded = false;
    alert("통신하는 도중, 오류가 발생했습니다.");
    logoutTrello();
    window.location.reload();
}