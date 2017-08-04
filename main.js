/////////////////////////////////////////////////////////////////
//      Copyright 2017 CREFFECT team All rights reserved.
//       Trello scheduler by Creta (creta5164@gmail.com)
/////////////////////////////////////////////////////////////////

const schedulerBoardName = "TrelloScheduler";    //Trello
let loginState;                                  //로그인 상태 (bool)
let programLoaded;                               //프로그램이 로드 된 상태 (bool)
let firstCreated;                                //최초로 보드가 생성된 경우의 상태 (bool)
let schedulerBoardData;                          //Trello 스케줄러가 생성한 보드의 데이터 (Object)

let requestCall;                                 

//주 진입부입니다.
function init() {
    loginState = false;
    programLoaded = false;
    firstCreated = false;

    if (window.location.hash.includes("#token=") &&
        window.location.hash.split("#token=")[1].length != 0)
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
    switch (steps) {
        default:
            logoutTrello();
            return;

        case 0:
            Trello.get("/members/me/boards/",
                CheckSchedulerBoardExists,
                LoadFailed
            );
            return;
        case 1:

            if (state == "new")
                InitSchedulerLists();

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
    for (var i = 0, len = list.length; i < len; i++)
        if (list[i].name == schedulerBoardName) {
            schedulerBoardData = list[i];
            loadProgram(1, firstCreated ? "new" : null);
            return;
        }

    firstCreated = true;
    Trello.rest('POST', 'boards', {
        name: schedulerBoardName,
        desc: "Trello 스케줄러가 사용하는 보드입니다, 특별한 일이 아니라면 삭제하거나 편집하지 마세요!"
    },
        function (result) { loadProgram(0); },
        LoadFailed
    );
}

//스케줄러 보드의 카드를 전부 지웁니다.
function InitSchedulerLists() {
    if (programLoaded) return;

    requestCall = [0, 0];

    Trello.get("/boards/" + schedulerBoardData.id + "/lists",
        InitLists,
        LoadFailed
    );
}

//스케줄러의 카드를 초기화합니다.
function InitLists(list) {
    requestCall = [0, list.length + 7];

    for (var i = 0, len = list.length; i < len; i++)
        Trello.put("/lists/" + list[i].id + "/closed?value=true", RInitListLoaded, LoadFailed);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (var i = 0, len = 7; i < len; i++)
        Trello.post("/lists?name=" + days[i] + "&idBoard=" + schedulerBoardData.id, RInitListLoaded, LoadFailed);
}

function RInitListLoaded()
{
    if (requestCall == null) return;
    console.log(++requestCall[0], requestCall[1]);
}

//Trello에 요청이 실패됐을 때 호출됩니다.
function LoadFailed() {
    programLoaded = false;
    alert("통신하는 도중, 오류가 발생했습니다.");
    logoutTrello();
    window.location.reload();
}