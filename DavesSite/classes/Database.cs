using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.IO;
using System.Data.SQLite;

namespace DavesSite {
    public static class Database {
        public static bool DoesDatabaseExist(Databases dtb) {
            switch (dtb) {
                case Databases.PCT:
                    return File.Exists(GetDatabasePath(Databases.PCT));
                default:
                    return false;
            }
        }

        public static void Create(Databases dtb) {
            switch (dtb) {
                case Databases.PCT:
                    SQLiteConnection.CreateFile(GetDatabasePath(Databases.PCT));
                    break;
            }
        }

        public static void Delete(Databases dtb) {
            switch (dtb) {
                case Databases.PCT:
                    File.Delete(GetDatabasePath(Databases.PCT));
                    break;
            }
        }

        public static string GetDatabasePath(Databases dtb) {
            switch (dtb) {
                case Databases.PCT:
                    return Directory.GetCurrentDirectory() + "\\pct.sqlite";
                default:
                    return "";
            }
        }
    }

    public class DatabaseConnection {
        SQLiteConnection _con;

        public DatabaseConnection(Databases dtb) {
            try {
                if (!Database.DoesDatabaseExist(dtb)) Database.Create(dtb);
                _con = new SQLiteConnection(getDatabaseString(dtb));
                _con.Open();
            } catch (Exception ex) {
                throw new Exception("An error occurred while attempting to make a database connection: " + ex.Message);
            }
        }

        public SQLiteConnection Connection {
            get {
                return _con;
            }
        }

        public void Close() {
            _con.Close();
        }

        public void Dispose() {
            _con.Dispose();
        }

        private string getDatabaseString(Databases dtb) {
            switch (dtb) {
                case Databases.PCT:
                    return "Data Source=" + Database.GetDatabasePath(Databases.PCT) + "; Version=3;";
                default:
                    return "";
            }
        }
    }

    public enum Databases {
        PCT
    }
}