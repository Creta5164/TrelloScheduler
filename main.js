let loginState;
let programLoaded;
const schedulerBoardName = "TrelloScheduler";
let schedulerBoardData;

function init() {
    loginState = false;
    programLoaded = false;
}

function loginTrello() {
    Trello.authorize({
        type: 'popup',
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

//트렐로 로그인 시도
function onAuthorize() {
    loginState = Trello.authorized();
    document.getElementById("logout").style.display = loginState ? "list-item" : "none";

    if (loginState && !programLoaded) loadProgram(0);
}

//트렐로 로그아웃
function logoutTrello() {
    Trello.deauthorize();
    onAuthorize();
    programLoaded = false;
    window.location.reload();
}

//트렐로 로그인 성공
function Trello_LoginSuccess() {
    loginState = true;
    document.getElementById("logout").style.display = "list-item";
    loadProgram(0);
}

//트렐로 로그인 실패
function Trello_LoginFail() {
    alert("계정 연동에 실패했습니다.");
}

//Trello 스케줄러를 시작합니다.
function loadProgram(steps) {
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

            return;
    }

    //finish a loading content
    programLoaded = true;
}

function CheckSchedulerBoardExists(list) {
    if (programLoaded) return;
    for (var i = 0, len = list.length; i < len; i++)
        if (list[i].name == schedulerBoardName) {
            schedulerBoardData = list[i];
            loadProgram(1);
            return;
        }

    Trello.rest('POST', 'boards', {
        name: schedulerBoardName,
        desc: "Trello 스케줄러가 사용하는 보드입니다, 특별한 일이 아니라면 삭제하거나 편집하지 마세요!"
    },
    function (result) { loadProgram(0); },
    LoadFailed);
}

function LoadFailed() {
    programLoaded = false;
    alert("통신하는 도중, 오류가 발생했습니다.");
    logoutTrello();
}