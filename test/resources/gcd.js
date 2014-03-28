function gcd(a, b)
{
  if (a == 0)
  { 
    return b;
  }
  
  if (b != 0)
  {
    if (a > b)
    {
      return gcd(a - b, b);
    }
  
    return gcd(a, b - a);
  }
 
  return a;
}