using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Text;

namespace DavesSite.PCT {
    public partial class Comms : System.Web.UI.Page {
        protected void Page_Load(object sender, EventArgs e) {
            try {
                string command = Request.QueryString["cmd"];
                if (command == "senddata") {

                    var dat = new Data() { };
                    //Temperature
                    decimal t;
                    if (!decimal.TryParse(Request.QueryString["temp"], out t))
                        throw new Exception("Could not parse Temperature");
                    else
                        dat.Temperature = t;

                    decimal h;
                    if (!decimal.TryParse(Request.QueryString["humi"], out h))
                        throw new Exception("Could not parse Humidity");
                    else
                        dat.Humidity = h;

                    int s;
                    if (!int.TryParse(Request.QueryString["soilM"], out s))
                        throw new Exception("Could not parse Soil Moisture");
                    else
                        dat.SoilMoisture = s;

                    int l;
                    if (!int.TryParse(Request.QueryString["light"], out l))
                        throw new Exception("Could not parse Light");
                    else
                        dat.Light = l;

                    dat.Commit();

                    StringBuilder sb = new StringBuilder();
                    Data.AddParamNamesToSB(sb);
                    sb.Append("|||");
                    dat.AddDataToSB(sb);
                    Response.Write(sb.ToString());
                } else {
                    Response.Write("No data was processed.");
                }
            } catch (Exception ex) {
                Response.Write("An error occurred when receiving data: " + ex.Message);
            }
            Response.Flush();
        }
    }
}