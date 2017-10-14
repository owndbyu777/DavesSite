
$(document).ready(function () {
    buildPage();
});

function buildPage() {
    $('#btnShowDatabaseMethods').click(function () {
        if ($('#divDatabaseMethods').css('display') == "none") {
            $('#divDatabaseMethods').css('display', "");
        } else {
            $('#divDatabaseMethods').css('display', "none");
        }
    });

    $('#btnCheckDatabaseExists').click(function () {
        DavesSite.ListEverything.ListEverything.doDatabaseMethods(JSON.stringify({ functionType: DatabaseMethodType.CheckExists }), function (rsp) {
            if (!rsp.error) {
                var objRsp = JSON.parse(rsp.value);
                if (objRsp.success) {
                    if (objRsp.exists)
                        window.alert("exists");
                    else
                        window.alert("nah brah");
                } else {
                    //error
                    window.alert(objRsp.error);
                }
            } else {
                //error
                window.alert("error");
            }
        }, null, null, function () { window.alert("error"); }, function () { window.alert("error"); });
    });

    $('#btnCreateDatabase').click(function () {
        DavesSite.ListEverything.ListEverything.doDatabaseMethods(JSON.stringify({ functionType: DatabaseMethodType.Create }), function (rsp) {
            if (!rsp.error) {
                var objRsp = JSON.parse(rsp.value);
                if (objRsp.success) {
                    window.alert("successfully created database");
                } else {
                    //error
                    window.alert(objRsp.error);
                }
            } else {
                //error
                window.alert("error");
            }
        }, null, null, function () { window.alert("error"); }, function () { window.alert("error"); });
    });

    $('#btnUpdateDatabase').click(function () {
        DavesSite.ListEverything.ListEverything.doDatabaseMethods(JSON.stringify({ functionType: DatabaseMethodType.Update }), function (rsp) {
            if (!rsp.error) {
                var objRsp = JSON.parse(rsp.value);
                if (objRsp.success) {
                    window.alert("successfully updated database");
                } else {
                    //error
                    window.alert(objRsp.error);
                }
            } else {
                //error
                window.alert("error");
            }
        }, null, null, function () { window.alert("error"); }, function () { window.alert("error"); });
    });

    $('#btnReadDatabase').click(function () {
        DavesSite.ListEverything.ListEverything.doDatabaseMethods(JSON.stringify({ functionType: DatabaseMethodType.Read }), function (rsp) {
            if (!rsp.error) {
                var objRsp = JSON.parse(rsp.value);
                if (objRsp.success) {
                    $('#dataContainer').html(objRsp.data);
                } else {
                    //error
                    window.alert(objRsp.error);
                }
            } else {
                //error
                window.alert("error");
            }
        }, null, null, function () { window.alert("error"); }, function () { window.alert("error"); });
    });


    $('#btnDeleteDatabase').click(function () {
        DavesSite.ListEverything.ListEverything.doDatabaseMethods(JSON.stringify({ functionType: DatabaseMethodType.Delete }), function (rsp) {
            if (!rsp.error) {
                var objRsp = JSON.parse(rsp.value);
                if (objRsp.success) {
                    window.alert("successfully deleted database");
                } else {
                    //error
                    window.alert(objRsp.error);
                }
            } else {
                //error
                window.alert("error");
            }
        }, null, null, function () { window.alert("error"); }, function () { window.alert("error"); });
    });

    attachStuff();
}

var DatabaseMethodType = {
    CheckExists: 0,
    Create: 1,
    Update: 2,
    Read: 3,
    Delete: 4
};

function attachStuff() {
    $('#divSearchBar input').on('input propertychange', function () {
        DavesSite.ListEverything.ListEverything.search(JSON.stringify({ search: $('#divSearchBar input').val() }), function (rsp) {
            if (!rsp.error) {
                var objRsp = JSON.parse(rsp.value);
                if (objRsp.success) {
                    //TODO: build results
                    $('#divResultsContainer > div:not(.dontdelete)').remove();
                    var $resultsContainer = $('#divResultsContainer');
                    if (typeof objRsp.items !== 'undefined') {

                    }
                } else {
                    //error
                    window.alert(objRsp.error);
                }
            } else {
                //error
                window.alert("error");
            }
        }, null, null, function () { window.alert("error"); }, function () { window.alert("error"); });
    });

    $('#newResult .btn').click(function () {
        DavesSite.ListEverything.ListEverything.add(JSON.stringify({ name: $('#newResult input').val(), description: $('#newResult textarea').val() }), function (rsp) {
            if (!rsp.error) {
                var objRsp = JSON.parse(rsp.value);
                if (objRsp.success) {
                    //TODO: add new row to list
                    
                } else {
                    //error
                    window.alert(objRsp.error);
                }
            } else {
                //error
                window.alert("error");
            }
        }, null, null, function () { window.alert("error"); }, function () { window.alert("error"); });
    });
}