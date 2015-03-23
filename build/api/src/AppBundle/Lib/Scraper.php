<?php

namespace AppBundle\Lib;
use Goutte\Client;
use Stichoza\Google\GoogleTranslate;

class Scraper {
    private $client;
    private $url;
    private $cssSelector;
    private $langFrom;
    private $langTo;

    public function __construct($langFrom, $langTo, $cssSelector, $url)
    {
        $this->client = new Client();
        $this->url = $this->addHttpToUrl($url);
        $this->cssSelector = $cssSelector;
        $this->langFrom = $langFrom;
        $this->langTo = $langTo;
    }

    public function getNodes()
    {
        $nodes = array();
        $crawler = $this->client->request('GET', $this->url);
        $crawler->filter($this->cssSelector)->each(
            function ($node) use (&$nodes){
                $nodes[] = GoogleTranslate::staticTranslate($node->text(), $this->langFrom, $this->langTo);
            }
        );
        return $nodes;
    }

    private function addHttpToUrl($url) {
        if (!preg_match("~^(?:f|ht)tps?://~i", $url)) {
            $url = "http://" . $url;
        }
        return $url;
    }
}