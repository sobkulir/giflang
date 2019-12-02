export TEXINPUTS=../tex//:
out_dir="dist"

.PHONY: all clean

all: thesis.pdf abstract.pdf

# LaTeX must be run multiple times to get references right
thesis.pdf: thesis.tex $(wildcard *.tex) bibliography.bib thesis.xmpdata
	mkdir -p $(out_dir)
	pdflatex -output-directory=$(out_dir) $<
	cp bibliography.bib $(out_dir)
	cd $(out_dir); bibtex thesis
	pdflatex -output-directory=$(out_dir) $<
	pdflatex -output-directory=$(out_dir) $<

abstract.pdf: abstract.tex abstract.xmpdata
	pdflatex -output-directory=$(out_dir) $<

clean:
	rm -rf $(out_dir)

clean_old:
	rm -f *.log *.dvi *.aux *.toc *.lof *.lot *.out *.bbl *.blg *.xmpi
	rm -f thesis.pdf abstract.pdf
