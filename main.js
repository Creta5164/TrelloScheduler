var loginState;

function onload()  {
    loginState = Trello.authorized;
    document.getElementById("logout").style.display = loginState ? "list-item" : "none";
}

function loginTrello()
{
    loginState = false;
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

function logoutTrello() {
    Trello.deauthorize();
    location.reload();
}

//트렐로 로그인 성공
function Trello_LoginSuccess()
{
    loginState = true;
    document.getElementById("logout").style.display = "list-item";
}

//트렐로 로그인 실패
function Trello_LoginFail()
{
    alert("로그인에 실패했습니다.");
    document.getElementById("logout").style.display = "none";
}
