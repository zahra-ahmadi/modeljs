function Analysis(dsg)
{
  this.isPureFunction = Analysis.isPureFunction(dsg.etg, dsg.ecg);
}

Analysis.isApplicationState =
  function (s)
  {
    return s.q.fun;
  }

Analysis.isApplicationStateOf =
  function (f)
  {
    return function (s) {return s.q.fun === f};
  }

Analysis.isNotApplicationStateOf =
  function (f)
  {
    return function (s) {return s.q.fun !== f};
  }

Analysis.applicationStatesOf =
  function (f, etg)
  {
    return etg.nodes().filter(Analysis.isApplicationStateOf(f));
  }

Analysis.functionInvocationCover = // note: we cannot use stack and check for absence of certain application!
  function (f, etg, ecg)
  {
    // find all applications of f
    var applicationStates = Analysis.applicationStatesOf(f, etg);
    // per application, determine fw reachable edges
    var fwReachable = applicationStates.flatMap(Dsg.fwReachable(etg, ecg));
    return fwReachable;
  }

Analysis.transitiveApplicationEffects = 
  function (etg, ecg)
  {
    return etg.edges().reduce(
      function (result, e)
      {
        var marks = e.marks || [];
        var rwaMarks = marks.filter(function (mark) {return mark instanceof StoreEffect});
        var bwStack = Dsg.bwStack(e.source, etg, ecg); // TODO memoize
        var applicationStates = bwStack.map(Edge.target).filter(Analysis.isApplicationState);
        return applicationStates.reduce(
          function (result, applicationState)
          {
            return result.put(applicationState, result.get(applicationState, ArraySet.empty()).addAll(rwaMarks));
          }, result);
      }, HashMap.empty());    
  }

Analysis.effects =
  function (edges)
  {
    return edges.reduce(
      function (result, edge)
      {
        var marks = edge.marks || [];
        return result.concat(marks.filter(function (mark) {return mark instanceof StoreEffect}));
      }, []);
  }

Analysis.isPureApplication =
  function (transitiveApplicationEffects, functionCoverEffects)
  {
    return transitiveApplicationEffects.every(
      function (effect)
      {
        if (effect.type === "R")
        {
          var address = effect.a;
          if (Arrays.contains(new StoreEffect("A", address), transitiveApplicationEffects, Eq.equals))
          {
            return true;
          }
          return !Arrays.contains(new StoreEffect("A", address), functionCoverEffects, Eq.equals)
            && !Arrays.contains(new StoreEffect("W", address), functionCoverEffects, Eq.equals);
        }
        if (effect.type === "W")
        {
          var address = effect.a;
          return Arrays.contains(new StoreEffect("A", address), transitiveApplicationEffects, Eq.equals);
        }
        return true;
      });
  }

Analysis.isPureFunction =
  function (etg, ecg)
  {
    return function (f)
    {
      var applications = Analysis.applicationStatesOf(f, etg);
      var transitiveRwaEffects = Analysis.transitiveApplicationEffects(etg, ecg);
      var functionCover = Analysis.functionInvocationCover(f, etg, ecg);
      var functionCoverEffects = Analysis.effects(functionCover);
      return applications.every(
        function (application)
        {
          var transitiveApplicationEffects = transitiveRwaEffects.get(application).values();
          return Analysis.isPureApplication(transitiveApplicationEffects, functionCoverEffects);
        });
    }
  }