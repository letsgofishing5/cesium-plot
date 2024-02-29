if [ $1 -eq 1 ]; then

  echo "===== Git Add ==="
  git add -A

  echo "=== Git Commit ==="
  git commit -m "${2:- feat}: ${3:- auto script push}"

  exit 0
fi
echo "=== Git Add ==="
git add -A
# echo "place sure commit msg is: ${1} ${2}"
# read -p "place sure commit msg is: ${1} ${2}. n/y?" sure



echo "=== Git Commit ==="
git commit -m "${1:- feat}: ${2:- auto script push}"

echo "=== Git Pull ==="
git pull

if  ! git diff --quiet --exit-code; then
  echo "=== File Conflict Found ==="
  exit 1
fi

echo "=== Git Push ==="
git push origin  ${3:- 'master'} 

echo "=== Script Finished ==="