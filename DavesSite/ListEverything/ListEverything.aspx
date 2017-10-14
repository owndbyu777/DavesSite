<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ListEverything.aspx.cs" Inherits="DavesSite.ListEverything.ListEverything" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">

    <script src="../content/js/ListEverything.js" type="text/javascript"></script>
    <link href="../content/css/default.css" rel="stylesheet" type="text/css" />
    <link href="../content/css/ListEverything.css" rel="stylesheet" type="text/css" />
    <title>List.Everything</title>
</head>
<body>
    <form id="form1" runat="server">
        <div class="btn" id="btnShowDatabaseMethods">Show/Hide Database Methods</div>
        <div id="divDatabaseMethods" style="display:none;width:100%;border-bottom: 4px solid black;padding-bottom:10px">
            <div class="btn" id="btnCheckDatabaseExists">Check Database Exists</div>
            <div class="btn" id="btnCreateDatabase">Create Database</div>
            <div class="btn" id="btnUpdateDatabase">Update Database</div>
            <div class="btn" id="btnReadDatabase">Read Database</div>
            <div class="btn" id="btnDeleteDatabase">Delete Database</div>
        </div>
        <div id="divContent">
            <div id="divSearchBar">
                <div class="text"><span>Search:</span></div>
                <div class="input"><input type="text" id="txbSearch" /></div>
            </div>
            <div id="divResultsContainer">
                <div class="result row hdr dontdelete">
                    <div class="col name">Name</div>
                    <div class="col desc">Description</div>
                    <div class="col save">Description</div>
                </div>
                <div id="newResult" class="result row new dontdelete">
                    <div class="col name"><input type="text" /></div>
                    <div class="col desc"><textarea></textarea></div>
                    <div class="col save"><div class="btn">Add</div></div>
                </div>
            </div>
        </div>
    </form>
</body>
</html>