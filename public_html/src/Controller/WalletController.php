<?php

namespace App\Controller;

use App\Lib\Emails;
use App\Lib\Sandbox;
use App\Lib\KYC;
use App\Lib\Misc;

use Cake\Event\Event;
use Cake\Filesystem\Folder;

use Cake\Core\Configure;
use Cake\Log\Log;

class WalletController extends AppController
{
    /**
     * beforeFilter callback.
     *
     * @param \Cake\Event\Event $event Event.
     * @return \Cake\Network\Response|null|void
     */
    public function beforeFilter(Event $event)
    {
        $langs = (new Folder(ROOT . '/src/Locale'))->read()[0];
        $this->set('langs', $langs);
        parent::beforeFilter($event);

        $this->viewBuilder()->layout('main');
        $this->IndianAuth->allow(['create', 'login'], $this->IndianAuth::PERMISSION_ALL);
    }

    /**
     * beforeRender callback.
     *
     * @param \Cake\Event\Event $event Event.
     * @return \Cake\Network\Response|null|void
     */
    public function beforeRender(Event $event)
    {
        parent::beforeRender($event);
    }

    /**
     * Create new wallet
     */
    public function create()
    {
        /*
        require_once ('Api/V1/php/NodeRPC.php');
        $izNode = new \NodeRPC(Configure::read('Api.host'), Configure::read('Api.pass'));

        $wallet = $izNode->createWallet();

        print("<pre>");
        var_dump($wallet);
        //$izNode->changeWallet($wallet);

        print_r($izNode->getInfo());
        die("STOP");


        echo "New wallet address: " . $wallet['id'] . "\n";
        //echo "New tiny address: " . \NodeRPC::getTinyAddress($wallet) . "\n";
        echo "Current address: " . $izNode->getWallet() . "\n";
        echo "\n";
        echo "Info about master wallet: \n";

        try {
            $masterWallet = $izNode->getWalletInfo('BL_1');
            echo "Full address: " . $masterWallet['id'] . "\n";
            echo "Balance: " . \NodeRPC::mil2IZ($masterWallet['balance']) . "\n";
        } catch (\ReturnException $e) {
            echo "Address not found\n";
        }

        try {
            var_dump($izNode->createTransaction('7a6545dbbfff0f4d9723d6f83bee85dc8b93cb47a9d178cbea9157eaffda3c09', \NodeRPC::IZ2Mil(1)));
        } catch (\ReturnException $e) {
            echo "Can't create transaction\n";
        }
        */

    }

    public function login()
    {
        $result = [
            'success' => false,
            'msg' => '',
            'data' => [],
        ];
        if ($this->request->is('get') && $this->request->is('ajax')) {
            $address = false;
            if(isset($this->request->query['addr'])){
                $address = substr($this->request->query['addr'], 0, 70);
            }
            if($address){
                require_once ('Api/V1/php/NodeRPC.php');
                require_once ('Api/V1/php/EcmaSmartRPC.php');

                $izNode = new \EcmaSmartRPC(Configure::read('Api.host'), Configure::read('Api.pass'));
                $wallet = $izNode->ecmaCallMethod($address, 'balanceOf', []);
                if(isset($wallet['error']) && 1 == $wallet['error']){



                    /*
                     * TODO
                     * Когда будет реализована возможность создавать кошелки по API(прямо на ноде, а не в браузере),
                     * то переписать код получения баланса адреса.
                     */
                    $result['msg'] = 'DEMO';



                }
            }

            $this->set([
                'result' => $result,
                '_serialize' => 'result',
            ]);
            $this->RequestHandler->renderAs($this, 'json');
        }
    }
}