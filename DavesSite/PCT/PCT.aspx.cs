using System;
using System.Collections.Generic;
using System.Web.Script.Serialization;

using System.Text;
using System.Data.SQLite;

namespace DavesSite.PCT {

    public partial class PCT :  classes.DavesSitePage {

        protected override void Page_Load(object sender, EventArgs e) {
            base.Page_Load(sender, e);
            AjaxPro.Utility.RegisterTypeForAjax(typeof(PCT));
        }

        [AjaxPro.AjaxMethod]
        public string doDatabaseMethods(string jsonDetails) {
            try {
                JavaScriptSerializer s = new JavaScriptSerializer();
                Dictionary<string, object> dic = s.Deserialize<Dictionary<string, object>>(jsonDetails);

                DatabaseMethodType methodType = (DatabaseMethodType)dic["functionType"];
                switch (methodType) {
                    case DatabaseMethodType.CheckExists:
                        return checkDatabaseExists(ref dic);
                    case DatabaseMethodType.Create:
                        return createDatabase(ref dic);
                    case DatabaseMethodType.Update:
                        return updateDatabase(ref dic);
                    case DatabaseMethodType.Read:
                        return readDatabase(ref dic);
                    case DatabaseMethodType.Delete:
                        return deleteDatabase(ref dic);
                    default:
                        return "{ \"success\": false, \"error\": \"This is not a valid database method\" }";
                }
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"" + Globals.EncodeJsString(ex.Message) + "\"}";
            }
        }

        private string checkDatabaseExists(ref Dictionary<string, object> dic) {
            try {
                if (Database.DoesDatabaseExist(Databases.PCT)) {
                    return "{\"success\": true, \"exists\": true }";
                } else {
                    return "{\"success\": true, \"exists\": false }";
                }
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"An error occurred when attempting to check if a database exists. " + Globals.EncodeJsString(ex.Message) + "\"}";
            }
        }

        private string createDatabase(ref Dictionary<string, object> dic) {
            var cnn = new DatabaseConnection(Databases.PCT);
            try {

                SQLiteCommand cmd = new SQLiteCommand(cnn.Connection);
                cmd.CommandText = "CREATE TABLE Data (" +
                    "d_ID INTEGER PRIMARY KEY NOT NULL, " +
                    "d_Temp DECIMAL(3, 2) NOT NULL, " +
                    "d_Humi DECIMAL(2, 1) NOT NULL, " +
                    "d_SoilM INT NOT NULL, " +
                    "d_Light INT NOT NULL)";
                cmd.ExecuteNonQuery();

                return "{\"success\": true }";
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"An error occurred when attempting to create a database. " + Globals.EncodeJsString(ex.Message) + "\"}";
            } finally {
                cnn.Close();
                cnn.Dispose();
            }
        }

        private string updateDatabase(ref Dictionary<string, object> dic) {
            try {

                Data d = new Data() {
                    Temperature = 30.5M,
                    Humidity = 12.5M,
                    SoilMoisture = 80,
                    Light = 10
                };
                d.Commit();

                Data d2 = new Data() {
                    Temperature = 3.5M,
                    Humidity = 80.5M,
                    SoilMoisture = 2,
                    Light = 100
                };
                d.Commit();

                return "{\"success\": true }";
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"An error occurred when attempting to update the database. " + Globals.EncodeJsString(ex.Message) + "\"}";
            }
        }

        private string readDatabase(ref Dictionary<string, object> dic) {
            try {

                var sb = new StringBuilder();
                var list = Data.GetObjectsWhere("");

                foreach (Data d in list) {
                    sb.Append("ID: ").Append(d.DataId)
                      .Append(", Temp: ").Append(d.Temperature)
                      .Append(", Humi: ").Append(d.Humidity)
                      .Append(", SoilM: ").Append(d.SoilMoisture)
                      .Append(", Light: ").Append(d.Light)
                      .Append("<br>");
                }

                return "{\"success\": true, \"data\": \"" + Globals.EncodeJsString(sb.ToString()) + "\" }";
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"An error occurred when attempting to update the database. " + ex.Message + "\"}";
            }
        }

        private string deleteDatabase(ref Dictionary<string, object> dic) {
            try {
                Database.Delete(Databases.PCT);

                return "{\"success\": true }";
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"An error occurred when attempting to update the database. " + Globals.EncodeJsString(ex.Message) + "\"}";
            }
        }

        private enum DatabaseMethodType {
            CheckExists = 0,
            Create = 1,
            Update = 2,
            Read = 3,
            Delete = 4
        }
    }
}