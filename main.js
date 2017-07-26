var loginState;
const schedulerBoardID = "TrelloScheduler";

function loginTrello()
{
    Trello.authorize({
        interactive: false,
        success: onAuthorize
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
}

//트렐로 로그인 성공
function Trello_LoginSuccess()
{
    loginState = true;
    document.getElementById("logout").style.display = "list-item";
    loadProgram();
}

//트렐로 로그인 실패
function Trello_LoginFail()
{
    alert("로그인에 실패했습니다.");
    document.getElementById("logout").style.display = "none";
}

//Trello 스케줄러를 시작합니다.
function loadProgram()
{
    
    if (CheckSchedulerBoardExists())
    {

    }
    else
    {

    }
}

function CheckSchedulerBoardExists()
{
    console.log(JSON.parse(Trello.members.get("me").responseText));
    var userID = JSON.parse(Trello.members.get("me").responseText).id;
    console.log(userID);
    var result = false;

    return false;
}