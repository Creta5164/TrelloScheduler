var loginState;
const schedulerBoardName = "TrelloScheduler";
var schedulerBoardData;

function init() {

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

    if (loginState) loadProgram();
}

//트렐로 로그아웃
function logoutTrello() {
    Trello.deauthorize();
    onAuthorize();
    window.location.reload();
}

//트렐로 로그인 성공
function Trello_LoginSuccess() {
    loginState = true;
    document.getElementById("logout").style.display = "list-item";
    loadProgram();
}

//트렐로 로그인 실패
function Trello_LoginFail() {
    alert("계정 연동에 실패했습니다.");
}

//Trello 스케줄러를 시작합니다.
function loadProgram() {
    Trello.get("/members/me/boards/",
        CheckSchedulerBoardExists,
        LoadFailed
    );
    
}

function CheckSchedulerBoardExists(list) {
    console.log("보드 색인 중...");

    for (var i = 0, len = list.length; i < len; i++)
        if (list[i].name == schedulerBoardName)
        {
            console.log("보드를 발견함.");
            schedulerBoardData = list[i];
            return;
        }

    console.log("보드를 생성함.");
    Trello.rest('POST', `boards`, {
        name: schedulerBoardName,
        desc: "Trello 스케줄러가 사용하는 보드입니다, 특별한 일이 아니라면 삭제하거나 편집하지 마세요!"
    });

    CheckSchedulerBoardExists();
}

function LoadFailed()
{
    alert("통신하는 도중, 오류가 발생했습니다.");
    logoutTrello();
}