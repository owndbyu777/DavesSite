using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Text;

using System.Data.SQLite;

namespace DavesSite.ListEverything {
    public class Section {
        private static long nextId = 0;

        private ObjectState state;
        private bool isInDatabase = false;

        private long d_ID = 0;
        private decimal d_Temp = 0;
        private decimal d_Humi = 0;
        private int d_SoilM = 0;
        private int d_Light = 0;

        public Section() {
            state = ObjectState.Added;
            isInDatabase = false;
            d_ID = --nextId;
        }

        public Section(int id, DatabaseConnection cnn = null) {
            var didOpen = false;
            if (cnn == null) {
                cnn = new DatabaseConnection(Databases.ListEverything);
                didOpen = true;
            }

            SQLiteCommand cmd = cnn.Connection.CreateCommand();
            cmd.CommandText = "SELECT * FROM Data WHERE d_ID = @d_ID";
            cmd.Parameters.Add(new SQLiteParameter("@d_ID", d_ID));

            var rdr = cmd.ExecuteReader();
            while (rdr.Read()) {
                d_Temp = (decimal)rdr["d_Temp"];
                d_Humi = (decimal)rdr["d_Humi"];
                d_SoilM = (int)rdr["d_SoilM"];
                d_Light = (int)rdr["d_Light"];

                isInDatabase = true;
            }

            if (didOpen) {
                cnn.Close();
                cnn.Dispose();
            }
        }

        public long DataId {
            get {
                return d_ID;
            }
        }

        public decimal Temperature {
            get {
                return d_Temp;
            }
            set {
                d_Temp = value;
                MarkAsChanged();
            }
        }

        public decimal Humidity {
            get {
                return d_Humi;
            }
            set {
                d_Humi = value;
                MarkAsChanged();
            }
        }

        public int SoilMoisture {
            get {
                return d_SoilM;
            }
            set {
                d_SoilM = value;
                MarkAsChanged();
            }
        }

        public int Light {
            get {
                return d_Light;
            }
            set {
                d_Light = value;
                MarkAsChanged();
            }
        }

        public void AddDataToSB(StringBuilder sb) {
            sb.Append(d_Temp).Append(", ").Append(d_Humi).Append(", ").Append(d_SoilM).Append(", ").Append(d_Light);
        }


        #region "Static functions"

        static public void AddParamNamesToSB(StringBuilder sb) {
            sb.Append("Temperature, Humidity, Soil Moisture, Light");
        }

        #endregion

        #region "SQL Functions"

        public static List<Section> GetObjectsWhere(string sqlWhereClause, DatabaseConnection cnn = null) {
            try {
                List<Section> list = new List<Section>();

                var didOpen = false;
                if (cnn == null) {
                    cnn = new DatabaseConnection(Databases.ListEverything);
                    didOpen = true;
                }

                SQLiteCommand cmd = cnn.Connection.CreateCommand();
                cmd.CommandText = "SELECT * FROM Data";
                if (!String.IsNullOrEmpty(sqlWhereClause)) cmd.CommandText += "WHERE " + sqlWhereClause;

                var rdr = cmd.ExecuteReader();
                while (rdr.Read()) {
                    Section d = new Section() {
                        d_ID = (long)rdr["d_ID"],
                        d_Temp = (decimal)rdr["d_Temp"],
                        d_Humi = (decimal)rdr["d_Humi"],
                        d_SoilM = (int)rdr["d_SoilM"],
                        d_Light = (int)rdr["d_Light"]
                    };

                    d.state = ObjectState.Nothing;
                    d.isInDatabase = true;

                    list.Add(d);
                }

                if (didOpen) {
                    cnn.Close();
                    cnn.Dispose();
                }

                return list;
            } catch (Exception ex) {
                throw new Exception("An error occured while getting Data objects WHERE from the database: " + ex.Message);
            }
        }

        public void MarkAsChanged() {
            if (state == ObjectState.Nothing) state = ObjectState.Updated;
        }

        public void Commit(DatabaseConnection cnn = null) {
            switch (state) {
                case ObjectState.Added:
                    Create(cnn);
                    break;
                case ObjectState.Updated:
                    Update(cnn);
                    break;
                case ObjectState.Deleted:
                    Delete(cnn);
                    break;
                default:
                    throw new Exception("An error occurred while committing a Data object: ObjectState not valid!");
            }
        }

        public void Create(DatabaseConnection cnn = null) {
            try {
                var didOpen = false;
                if (cnn == null) {
                    cnn = new DatabaseConnection(Databases.ListEverything);
                    didOpen = true;
                }

                var cmd = cnn.Connection.CreateCommand();
                cmd.CommandText = "INSERT INTO Data (d_Temp, d_Humi, d_SoilM, d_Light) VALUES(@d_Temp, @d_Humi, @d_SoilM, @d_Light); SELECT last_insert_rowid();";
                cmd.Parameters.Add(new SQLiteParameter("@d_Temp", d_Temp));
                cmd.Parameters.Add(new SQLiteParameter("@d_Humi", d_Humi));
                cmd.Parameters.Add(new SQLiteParameter("@d_SoilM", d_SoilM));
                cmd.Parameters.Add(new SQLiteParameter("@d_Light", d_Light));

                try {
                    d_ID = (long)cmd.ExecuteScalar();
                } catch (Exception ex) {
                    throw new Exception("An error occured while executing the insert command on a Data in the database: " + ex.Message);
                }

                isInDatabase = true;

                if (didOpen) {
                    cnn.Close();
                    cnn.Dispose();
                }
            } catch (Exception ex) {
                throw new Exception("An error occured while creating a Data in the database: " + ex.Message);
            }
        }

        public void Update(DatabaseConnection cnn = null) {
            try {
                var didOpen = false;
                if (cnn == null) {
                    cnn = new DatabaseConnection(Databases.ListEverything);
                    didOpen = true;
                }


                var cmd = cnn.Connection.CreateCommand();
                cmd.CommandText = "UPDATE Data SET " +
                    "d_Temp = @d_Temp, " +
                    "d_Humi = @d_Humi, " +
                    "d_SoilM = @d_SoilM, " +
                    "d_Light = @d_Light " +
                    "WHERE d_ID = @d_ID";
                cmd.Parameters.Add(new SQLiteParameter("@d_Temp", d_Temp));
                cmd.Parameters.Add(new SQLiteParameter("@d_Humi", d_Humi));
                cmd.Parameters.Add(new SQLiteParameter("@d_SoilM", d_SoilM));
                cmd.Parameters.Add(new SQLiteParameter("@d_Light", d_Light));
                cmd.Parameters.Add(new SQLiteParameter("@d_ID", d_ID));

                try {
                    d_ID = (int)cmd.ExecuteScalar();
                } catch (Exception ex) {
                    throw new Exception("An error occured while executing the insert command on a Data in the database: " + ex.Message);
                }

                isInDatabase = true;

                if (didOpen) {
                    cnn.Close();
                    cnn.Dispose();
                }
            } catch (Exception ex) {
                throw new Exception("An error occured while updating a Data in the database: " + ex.Message);
            }
        }

        private bool CanDelete() {
            if (!isInDatabase) {
                return false;
            } else {
                return true;
            }
        }

        public void Delete(DatabaseConnection cnn = null) {
            throw new Exception("Not full implemented yet.");

            if (CanDelete()) {
                try {
                    var didOpen = false;
                    if (cnn == null) {
                        cnn = new DatabaseConnection(Databases.ListEverything);
                        didOpen = true;
                    }

                    if (didOpen) {
                        cnn.Close();
                        cnn.Dispose();
                    }
                } catch (Exception ex) {
                    throw new Exception("An error occured while deleting a Data from the database." + ex.Message);
                }
            } else {
                throw new Exception("Cannot delete.");
            }
        }

        #endregion
    }
}