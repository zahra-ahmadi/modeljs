function drawLinks(etg, ecg, meta, element, ww)
{
  var EPS = {};
  var nodes = etg.nodes().sort(function (node1, node2) {return node1.index - node2.index});
  var edges = etg.edges().sort(function (link1, link2) {return link1.index - link2.index});
  var frames = [];
  
  function nodeIndexer(x)
  {
    if (Array.isArray(x))
    {
      return x.map(nodeIndexer)
    }
    else
    {
      return x.index;
    }
  }
  
  function frameIndexer(x)
  {
    if (Array.isArray(x))
    {
      return x.map(frameIndexer)
    }
    else
    {
      return Arrays.indexOf(x, frames, Eq.equals);
    }
  }
  
  ilinks = edges.map(
    function (link)
    {
      var sourceIndex = Arrays.indexOf(link.source, nodes, Eq.equals);
      if (sourceIndex < 0)
      {
        sourceIndex = nodes.length;
        nodes[sourceIndex] = link.source;
      }
      var label = link.g;
      if (label)
      {
        var frame = label.frame;
        if (frame)
        {
          var frameIndex = Arrays.indexOf(frame, frames, Eq.equals);
          if (frameIndex === -1)
          {
            frameIndex = frames.length;
            frames[frameIndex] = frame;
          }
          label = label.isPush ? new Push(frameIndex) : (label.isPop ? new Pop(frameIndex) : new Unch(frameIndex));
        }
      }
      else
      {
        label = EPS;
      }
      var targetIndex = Arrays.indexOf(link.target, nodes, Eq.equals);
      if (targetIndex === -1)
      {
        targetIndex = nodes.length;
        nodes[targetIndex] = link.target;
      }
      var ilink = new Edge(sourceIndex, label, targetIndex, link.marks);
      ilink.index = link.index;
      return ilink;
    });
  
  var dot = "digraph fsm {";//rankdir=LR;\n";
  nodes.forEach(
    function (node)
    {
//      var label = node.index + " "; // creation index
      var label = "";
      var q = node.q;
      if (q.node)
      {
        label += String(q.node).substring(0,20);
      }
      else if (q.value !== undefined)
      {
        label += String(q.value);
      }
      else
      {
        label += q.type;
      }
      dot += node.index + " [label=\"" + label + "\"];\n";
    });
  ilinks.forEach(
    function (link)
    {
      if (link.g !== EPS)
      {
        var label = String(link.g);
        if (link.g.frame !== null)
        {
          label += " " + frames[link.g.frame].toString();
        }
//        label += " (" + link.index + ")";
        if (link.marks)
        {
          label += " " + link.marks;
        }
//        if (link.g.frame && frames[link.g.frame].benv && Arrays.contains("4@(fib (- n 1))", frames[link.g.frame].benv.addresses().map(String), Eq.equals))
//        {
//          label += "***";
//        }
//        if (nodes[link.source].store && nodes[link.target].store)
//        {
//          label += " :: " + nodes[link.source].store.diff(nodes[link.target].store).split("\n").join("*");          
//        }
        dot += link.source + " -> " + link.target + " [label=\"" + label + "\", taillabel=\"" + link.index + "\",labeldistance=1.6];\n";        
      }
      else
      {
        dot += link.source + " -> " + link.target + " [style=\"dotted\"];\n";
      }
    });
  dot += "}";
//  console.log(dot);
  var svg = Viz(dot, "svg");
  element.append(svg);
  $("g.node", ww.document).each(
    function ()
    {
      var $this = $(this);
      var nodeIndex = $("title", $this).text();
      var node = nodes[nodeIndex];
      var q = node.q;
      var ss = node.ss;
      var marks = q.marks ? ("\nmarks " + q.marks) : "";
      $this.attr("id", nodeIndex);
      var tooltip = nodeIndex + " " + q.nice();
      tooltip += "\nbenv " + (q.benv ? q.benv._map.keys() : q.benva) + marks;
      tooltip += "\neps pre " + nodeIndexer(ecg.predecessors(node));        
      tooltip += "\neps succ " + nodeIndexer(ecg.successors(node));        
      tooltip += "\nss " + ss;
      tooltip += "\n" + node.debug;
      $("title", $this).text(tooltip);
      var constructorName = String(q.constructor);
      constructorName = constructorName.substring(0, constructorName.length - 2);
//      $this.attr("class", "node " + constructorName + (ssd.length > 0 ? " stacky" : "")); // addClass doesn't seem to work
      $this.attr("class", "node " + constructorName); // addClass doesn't seem to work
      $this.dblclick(function ()
      {
        var newwindow=ww.open();
        var newdocument=newwindow.document;
        var nfa = Pushdown.epsilonReachableGraph(node, etg, ecg);
        newdocument.write("<html><head><link rel='stylesheet' href='jipda.css' type='text/css'/></head><body><div id='nfa'></div></body>");
        var el2 = $(newdocument).find("#nfa");
        drawLinks(nfa, Graph.empty(), meta, el2, newwindow);
        newdocument.close();
      });
    });
//  $("g.edge", ww.document).each(
//      function ()
//      {
//        var $this = $(this);
//        var path = $this.find("title").text(); 
//        print("@#$&", path);
//      })
      
  return {nodes:nodes, edges:edges, frames:frames};
}