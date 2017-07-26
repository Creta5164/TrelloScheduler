var loginState;
const schedulerBoardID = "TrelloScheduler";

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
    for (var i = 0, len = list.length; i < len; i++)
        console.log(list[i]);
}

function LoadFailed()
{
    alert("통신하는 도중, 오류가 발생했습니다.");
    logoutTrello();
}