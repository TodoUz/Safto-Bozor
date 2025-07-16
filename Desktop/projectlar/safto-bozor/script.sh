#!/bin/bash

# 1. Keraksiz fayllarni Git kuzatuvidan olib tashlash
git rm -r --cached .

# 2. .gitignore faylini yaratish yoki yangilash
cat <<EOT > .gitignore
# Tizim fayllari
*.lnk
desktop.ini
*.mkv
*.mp4
*.jpg
*.docx
*.pdf
*.dat
*.log
*.regtrans-ms
*.blf
ntuser.*

# Tizim papkalari
DArs/
AppData/
Documents/
Downloads/
Pictures/
Videos/
Music/
OneDrive/
.vscode/
node_modules/
.docker/
.cristalix/
.gologin/
.pm2/
.ssh/
.swt/

# Vaqtinchalik fayllar
*.tmp
*.bak
*.zip
EOT

# 3. Faqat safto-bozor-frontend va your_advanced papkalarini qo'shish
git add safto-bozor-frontend/ your_advanced/

# 4. O'zgarishlarni commit qilish
git commit -m "Faqat safto-bozor-frontend va your_advanced papkalarini qo'shish"

# 5. Remote repoga sinxronlash
git pull origin main --rebase
if [ $? -eq 0 ]; then
    echo "Pull muvaffaqiyatli yakunlandi"
    git push origin main
else
    echo "Konflikt yuz berdi, iltimos, konfliktlarni qo'lda hal qiling"
    echo "Konfliktli fayllarni tuzatgandan so'ng, quyidagi buyruqlarni bajaring:"
    echo "git add ."
    echo "git rebase --continue"
    echo "git push origin main"
fi