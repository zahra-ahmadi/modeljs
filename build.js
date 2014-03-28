load("lib/esprima.js");

var console = {log:print}

if (!Object.is) {
  Object.is = function(v1, v2) {
    if (v1 === 0 && v2 === 0) {
      return 1 / v1 === 1 / v2;
    }
    if (v1 !== v1) {
      return v2 !== v2;
    }
    return v1 === v2;
  };
}

if (!this.read)
{
  read = function (path)
  {
    var br = new java.io.BufferedReader(new java.io.FileReader(path));
    var sb = new java.lang.StringBuilder();
    var line = br.readLine();
    while (line !== null)
    {
      sb.append(line);
      sb.append("\n");
      line = br.readLine();
    }
    br.close();
    return sb.toString();
  }
}

function b()
{
  load("common.js");
  load("store.js");
  load("agc.js");
  load("test.js");
  load("lattice.js");
  load("lattice1.js");
  load("setLattice.js");
  load("cpLattice.js");
  load("address.js");
  load("graph.js");
  load("pushdown.js");
  load("dsg.js");
  load("jsEsprima.js");
  load("jsCesk.js");
  load("tagAg.js");
  load("concreteAg.js");
  load("object.js");
  load("analysis.js");
  load("modeljs.js");
  
  load("test/concreteTests.js");
  load("test/jipdaTests.js");
}

b();