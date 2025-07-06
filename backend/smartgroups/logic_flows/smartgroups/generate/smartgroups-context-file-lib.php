<phpfile path="SmartGroups/Redis/tLoadDataToRedis.php">
<?php namespace SmartGroups\Redis;

/**
 * Basic functionality a loader would need
 * 
 * @author itay
 *
 */
trait tLoadDataToRedis{
   
    /**
     *
     * @var array<string>
     */
    protected array $redis_key_params;
    
    /**
     *
     * @var \SiTEL\DataSources\Redis\Mask\Set
     */
    protected \SiTEL\DataSources\Redis\Mask\Set $RedisClient;
    
    /**
     * Instantiate the RedisClient 
     * @param array $redis_key_params
     */
    protected function setRedisClientFromFactory(array $redis_key_params):void{
        $this->RedisClient = \SmartGroups\Redis\RedisAPI::factory_client($this->redis_key_params);//TODO where is it?!
    }
    
    /**
     * The Redis SET on manages this rule group
     * U can instantiate this Client by calling.
     *  \SmartGroups\Redis\RedisAPI::factory_client(array redis_key_params);
     * 
     * @var \SiTEL\DataSources\Redis\Mask\Set
     */
    public function getRedisClient():\SiTEL\DataSources\Redis\Mask\Set{
        return $this->RedisClient;    
    }
   
    /**
     * for now, I'll clean storage just before any upload, we can improve performance later if needed.
     */
    public function cleanStorage(): void
    {
        $this->getRedisClient()->del();
    }
    
    /**
     * Check the redis key is filled, in which case, I can skip the loader, for example.
     *
     * @return int
     */
    public function checkStorageIsFilled(): int
    {
        return $this->getRedisClient()->exists();
    }
    
    
    /**
     * The key for the SET that was created/loaded by this object
     *
     * @return array<string>
     */
    public function getRedisPreKey(): array
    {
        return $this->redis_key_params;
    }
}
</phpfile>

<phpfile path="SmartGroups/Redis/RedisAPI.php">
<?php namespace SmartGroups\Redis;

/**
 * Manages the communicsation with Redis
 * 
 * @author itay
 *
 */
abstract class RedisAPI{
    
    /**
     * Separator in the key name in Redis when comboing several groups
     * @var string
     */
    const FIELD_SEPARATOR = '-';
    
    /**
     * Generates the specific key id by input params (Just the params section)
     * 
     * @param array<int|string> $params [1,2,3,4]
     * @return string
     */
    static public function generate_key_id(array $params):string{
        $actions = str_replace(['_id','_'],'',join('',array_keys($params)));
        $values  = join(self::FIELD_SEPARATOR,$params);
        return "{$actions}:{$values}";
    }
    
    /**
     * Get the actual Redis client wrapped in SET 
     * 
     * @param array<string> $params
     * @return mixed
     */
    static public function factory_client(array $params){
        return self::factory_key($params)->get_client();
    }
    
    /**
     * Generates the KEY object alone. 
     * Used below when doing calculations and storing results into
     * third key
     * 
     * @param array $params
     * @return \SiTEL\DataSources\Redis\aKeyBoss
     */
    static public function factory_key(array $params):\SiTEL\DataSources\Redis\aKeyBoss{
        $id = self::generate_key_id($params);
        $init_redis_func = \SmartGroups\CONFIG::CFG()->REDIS_KEYBOSS_FACTORY_CALLABLE;
        return $init_redis_func($id);
    }
    
    /**
     * Get an array of key parameters (NOT KEY OBJECTS) sum them
     * into a third Key, which I return just it's params
     * 
     * @param array $keys
     * @return array
     */
    static public function sum(array $keys):array{
        //get the first key and the last to describe the sum and generate the new key
        $k1 = $keys[0];
        $kn = end($keys);
        $sum_key = ['sum' => join(self::FIELD_SEPARATOR,$k1) . self::FIELD_SEPARATOR . join(self::FIELD_SEPARATOR,$kn)];
        
        $key_boss_array = [];
        foreach ($keys as $key){
            $key_boss_array[]=self::factory_key($key);
        }
        $R = self::factory_client($sum_key);
        $R->sunionstore_array($key_boss_array);
        $R->expire(\SmartGroups\CONFIG::INTERNAL__CACHE_INTERMEDIATE_SETS);
        return $sum_key;
    }
    
    /**
     * @param array $group_b
     * @param string $from - NOT USED , it is a comment?!
     * @param array $group_a
     * @return array of the params section of the key that stores results
     */
    static public function subtract(array $group_b,$from,array $group_a):array{
        $result_group_key = $group_b;
        $result_group_key['subtracting']=join(self::FIELD_SEPARATOR,$group_a);
        $result_group = self::factory_client($result_group_key);
        $result_group->sdiffstore(self::factory_key($group_a),self::factory_key($group_b));
        $result_group->expire(\SmartGroups\CONFIG::INTERNAL__CACHE_INTERMEDIATE_SETS);
        //\dbgr('KEY!',$result_group_key);
        return $result_group_key;
    }
    
    /**
     * Intersects and expires.
     *
     * @param array $group_a
     * @param string $with
     * @param array $group_b
     */
    static public function intersec(array $group_a, $with,array $group_b):array{
        $result_group_key = $group_b;
        $result_group_key['intersected']=join(self::FIELD_SEPARATOR,$group_a);
        $result_group = self::factory_client($result_group_key);
        $result_group->sinterstore(self::factory_key($group_a),self::factory_key($group_b));
        $result_group->expire(\SmartGroups\CONFIG::INTERNAL__CACHE_INTERMEDIATE_SETS);
        //dbgr('KEY!',$result_group_key);//TODO get logger!
        return $result_group_key;
    }
    
    /**
     * n# of seconds to keep the SETs in Redis
     * TODO comes from CONFIG
     * @return int
     */
    static public function expire_in_seconds():int{
        return \SmartGroups\CONFIG::CFG()->CACHE_SETS_FOR_X_SECONDS;
    }
}
</phpfile>

<phpfile path="SmartGroups/Redis/iLoadDataToRedis.php">
<?php namespace SmartGroups\Redis;

/**
 * Explains what a aLoader has to do
 * @author itay
 *
 */
interface iLoadDataToRedis{

    /**
     * The Redis SET on manages this rule group
     * U can instantiate this Client by calling.
     * \SmartGroups\Redis\RedisAPI::factory_client(array redis_key_params);
     
     * @return \SiTEL\DataSources\Redis\Mask\Set
     */
    function getRedisClient():\SiTEL\DataSources\Redis\Mask\Set;
    
    /**
     * 
     * @param array<mixed> $params_from_rule
     * @param bool $force_refresh
     * @return array<string> I think this is The rule redis key TODO unify key
     */
    static public function loadData(array $params_from_rule, bool $force_refresh): array;
    
}
</phpfile>

<phpfile path="SmartGroups/CONFIG.php">
<?php namespace SmartGroups;

/**
 * Global configuration for this module.
 * This is a Factory and a one time deal.
 * Values can not be changed later on.
 * 
 * TEMBLE_MOD : do extra validation and prevent some edge cases, like minclude/subtract more than one Rule
 * 
 * REDIS_KEYBOSS_FACTORY  : A closure that returns a key object specific to the calling system
 * this can look like : fn($id)=>new \Redis_SomeKeyBoss_Class($id)
 * 
 * 
 * @author itay
 *
 */
class CONFIG{
    
    /**
     * 
     * @var string $PARAMS_LABELS__RULENAME Adds this to the key name in Redis. Usefull when u might have several rules with same name
     * @var string $PARAMS_LABELS__STATIC_SET_MEMBERS used in StaticSET to hold the static list of identifiers
     */
    public const PARAMS_LABELS__RULENAME            = 'ruleName',
                 PARAMS_LABELS__STATIC_SET_MEMBERS  = 'staticSetMembers' 
    ;
    
    /**
     * 
     * @var integer The time we cache the results of actions between rules. Usually no need for longer than the calculation of the current TREE
     */
    public const INTERNAL__CACHE_INTERMEDIATE_SETS = 300;
    
    /**
     * @param bool $TEMBLE_MOD
     * @param ?callable $REDIS_KEYBOSS_FACTORY
     * @param int $STATIC_MAX_MEMBERS defaults to 20
     * @param bool $ENFORCE_COMMENTS_IN_PHP when reading PHP code, enforcing a comment at the start that will be used for tree description
     * @param int $CACHE_SETS_FOR_X_SECONDS How many seconds cache the loaded sets in Redis. MAKE SURE they are cached for atleast the time it take your entire proces to run. Defaults to 1 hour
     * @throws \Exception
     */
    static public function SET(bool $TEMBLE_MOD,?callable $REDIS_KEYBOSS_FACTORY=null,int $STATIC_MAX_MEMBERS=20,bool $ENFORCE_COMMENTS_IN_PHP=true,int $CACHE_SETS_FOR_X_SECONDS=3600):void{
        if(self::$CONFIG){
            throw new \Exception('This CONFIG was already setup previously');
        }
        if(!$REDIS_KEYBOSS_FACTORY){//sometimes we want empty cllabals, when no need to Redis
            $REDIS_KEYBOSS_FACTORY = fn($id)=>null;
        }
        self::$CONFIG = new self(
            TEMBLE_MOD: $TEMBLE_MOD,
            REDIS_KEYBOSS_FACTORY: $REDIS_KEYBOSS_FACTORY,
            STATIC_MAX_MEMBERS: $STATIC_MAX_MEMBERS,
            ENFORCE_COMMENTS_IN_PHP: $ENFORCE_COMMENTS_IN_PHP,
            CACHE_SETS_FOR_X_SECONDS: $CACHE_SETS_FOR_X_SECONDS);
    }

    /**
     * @return CONFIG
     * @throws \Exception
     */
    static public function CFG():CONFIG{
        if(!self::$CONFIG){
            throw new \Exception('This CONFIG is not instantiated yet');
        }
        return self::$CONFIG;
    }
    
    /**
     * 
     * @var ?CONFIG
     */
    static private ?CONFIG $CONFIG=null;
    
    /**
     * 
     * @param bool $TEMBLE_MOD do extra validation and prevent some edge cases, like minclude/subtract more than one Rule
     * @param callable $REDIS_KEYBOSS_FACTORY A closure that returns a key object specific to the calling system
     * @param int $STATIC_MAX_MEMBERS
     */
    private function __construct(bool $TEMBLE_MOD,callable $REDIS_KEYBOSS_FACTORY,int $STATIC_MAX_MEMBERS,bool $ENFORCE_COMMENTS_IN_PHP,int $CACHE_SETS_FOR_X_SECONDS){
        $this->TEMBLE_MOD = $TEMBLE_MOD;
        $this->REDIS_KEYBOSS_FACTORY_CALLABLE = $REDIS_KEYBOSS_FACTORY;
        $this->STATIC_MAX_MEMBERS = $STATIC_MAX_MEMBERS;
        $this->ENFORCE_COMMENTS_IN_PHP = $ENFORCE_COMMENTS_IN_PHP;
        $this->CACHE_SETS_FOR_X_SECONDS = $CACHE_SETS_FOR_X_SECONDS;
    }
    
    /**
     * 
     * @var bool
     */
    public readonly bool $TEMBLE_MOD;
    
    /**
     * 
     * @var callable
     */
    public $REDIS_KEYBOSS_FACTORY_CALLABLE;
    
    /**
     * Maximum members allowed in static SET rule
     * 
     * @var int
     */
    public readonly int $STATIC_MAX_MEMBERS;
    
    /**
     * When parsing PHP code of a SET Tree, should I enforce a comment at the beginning of the file?
     * Used only when translating PHP to JSON, not when running the calculation of SETS
     * 
     * @var bool defaults to true
     */
    public readonly bool $ENFORCE_COMMENTS_IN_PHP;
    
    /**
     * How many seconds cache the loaded sets in Redis. 
     * MAKE SURE they are cached for atleast the time it take your 
     * entire proces to run. Defaults to 1 hour
     * 
     * @var int
     */
    public readonly int $CACHE_SETS_FOR_X_SECONDS;
}
</phpfile>

<phpfile path="SmartGroups/Transformers/PHPToJson.php">
<?php namespace SmartGroups\Transformers;

/**
 * Takes a tree file (php code) and translates to JSON
 * using the internal TreeToJson
 * @author itay
 *
 */
class PHPToJson{
    
    /**
     * The decoded json to convert to later convert to a JSON strings;
     * 
     * @var \stdClass
     */
    private \stdClass $decodedJson;

    /**
     * Fail the process if trying to fetch the JSON before all parts of JSON are there
     * Treshold to success is 2. Each successfull action ++ this
     * 
     * @var int
     */
    private int $makeSureIAmDone = 0;
    
    /**
     * 
     * @param string $filename
     * @throws \Exception
     */
    public function __construct(private string $filename){
        $this->decodedJson = new \stdClass;
        $this->decodedJson->treeMeta = [];
    }
    
    /**
     * last part of file name (after last /) is the tree name 
     * For example: file /baba/mosh/was/here/groupStark.php => treeName: groupStark
     * Comments in the begininng of the file are the description
     * If 'Enforce Comments' mod is on, fail on no comment
     * 
     * @throws \Exception
     */
    public function populateMetadata():void{
        //name of tree
        $filename_parts = explode(DIRECTORY_SEPARATOR,$this->filename);
        $this->decodedJson->treeMeta['treeName'] = str_replace('.php', '',$filename_parts[count($filename_parts)-1]);
        $this->decodedJson->treeMeta['treeDescription'] = ''; 
        $inside_comment = false;
        
        $file_content = file_get_contents($this->filename);
        if(!$file_content){
            throw new \Exception("[{$this->filename}] has no content!");
        }
        
        $file_lines   = explode(PHP_EOL,$file_content);
        foreach ($file_lines as $d=>$line){
            //TODO use logger injected info("{$d}: {$line}");
            if(str_contains($line, '/*')){
                $inside_comment = true;
                continue;
            }
            
            if(str_contains($line, '*/')){
                $inside_comment = false;
                break;
            }
            
            if($inside_comment){
                $this->decodedJson->treeMeta['treeDescription'].= str_replace(['*','/',"'"],'',$line) . "\n";
                continue;
            }
        }
        
        if($inside_comment){
            throw new \Exception('Comment was not closed properly with */');
        }
        
        if(\SmartGroups\CONFIG::CFG()->ENFORCE_COMMENTS_IN_PHP && trim($this->decodedJson->treeMeta['treeDescription']) === ''){
            throw new \Exception("[{$this->filename}] No /***** Comment ******/ was found. Make sure to have a multy line comment at the beginning of the file. First line /****... and last line ...***/");
        }
        
        $this->makeSureIAmDone++;
    }
 
    /**
     * Init the actual tree and use internal pulse to get a stdClass
     * representation of the tree
     */
    public function parsePHP():void{
        /** @var \SmartGroups\Rules\aRule $Root */
        $Root = include $this->filename;
        $this->decodedJson->root = new \stdClass;
        $Root->pulseValidate()->pulseToJSON($this->decodedJson->root);
        $this->makeSureIAmDone++;
    }
    
    /**
     * 
     * @throws \Exception
     * @return string
     */
    public function json():string{
        if($this->makeSureIAmDone < 2){
            throw new \Exception('Looks like either ->populateMetadata() or ->parsePHP() were not called!');
        }
        $j = json_encode($this->decodedJson);
        if(!$j){
            throw new \Exception("Tree for [{$this->filename}] was not able to be converted to JSON!");
        }
        return $j;
    }
}
</phpfile>

<phpfile path="SmartGroups/Transformers/JsonToTree.php">
<?php namespace SmartGroups\Transformers;

/**
 * Takes a JSON and converts it to a rule tree
 * @author itay
 *
 */
class JsonToTree{
    
    /**
     * The decoded json to convert to a tree;
     * 
     * @var \stdClass
     */
    private \stdClass $decodedJson;
    
    /**
     * 
     * @param string $json
     * @throws \Exception
     */
    public function __construct(string $json){
        $this->decodedJson = json_decode($json);
        if($this->decodedJson === null){
            //TODO use injected logger \fatal('Failed decoding JSON');
            //TODO use injected logger \fatal($json);
            throw new \Exception('Failed decoding input JSON [' . print_r($json,true) . ']');
        }
        
    }
    
    /**
     * API
     * THIS IS THE ENTRY point for this recurssion.
     * This is called only once!
     * 
     * @return \SmartGroups\Rules\aRule
     */
    public function convertJsonToTree():\SmartGroups\Rules\aRule{
        $rootJSON = $this->decodedJson->root;
        
        $class_name = !strpos('\\',0) ? $rootJSON->ruleClass : '\\' . $rootJSON->ruleClass;
        /** @var \SmartGroups\Rules\aRule $Root */
        $Root = new $class_name((array)$rootJSON->params,$rootJSON->forceRefresh);
        $this->traverseJSON($rootJSON, $Root);
        return $Root;
    }
 
    /**
     * Traverse and translate
     * 
     * @param \stdClass $ParentJSON
     * @param \SmartGroups\Rules\aRule $ParentNode
     */
    private function traverseJSON(\stdClass $ParentJSON,\SmartGroups\Rules\aRule|\SmartGroups\Rules\Union $ParentNode):void{
        
        /**
         * This is union
         */
        if(isset($ParentJSON->unionChilds)){
            
            foreach($ParentJSON->unionChilds as $UnionChildJSON){
                $class_name = !strpos('\\',0) ? $UnionChildJSON->ruleClass : '\\' . $UnionChildJSON->ruleClass;
                /** @var \SmartGroups\Rules\aRule $UnionChild */
                $UnionChild = new $class_name((array)$UnionChildJSON->params,$UnionChildJSON->forceRefresh);
                $ParentNode->union_include($UnionChild);
                $this->traverseJSON($UnionChildJSON, $UnionChild);
            }
        }
        
        /**
         * We have child branches
         */
        if($ParentJSON->branches){
            foreach($ParentJSON->branches as $BranchChildJSON){
                $class_name = !strpos('\\',0) ? $BranchChildJSON->ruleClass : '\\' . $BranchChildJSON->ruleClass;
                /** @var \SmartGroups\Rules\aRule $BranchChild */
                $BranchChild = new $class_name((array)$BranchChildJSON->params,$BranchChildJSON->forceRefresh);
                match($BranchChildJSON->actionUpstream){
                    \SmartGroups\Rules\aRule::BRANCH_SET_OPERATION__INTERSECT => $ParentNode->intersect($BranchChild),
                    \SmartGroups\Rules\aRule::BRANCH_SET_OPERATION__SUBTRACT  => $ParentNode->subtract($BranchChild),
                    \SmartGroups\Rules\aRule::BRANCH_SET_OPERATION__NONE      => null,//no need to do nothing, Either parent is a Union and this is a union child or this is Root
                    default => throw new \Exception('Missing action type')
                };
                $this->traverseJSON($BranchChildJSON, $BranchChild);
            }
        }
    }
    
}
</phpfile>

<phpfile path="SmartGroups/Transformers/JsonToPHP.php">
<?php namespace SmartGroups\Transformers;

/**
 * Takes a JSON and converts it to a PHP code with the rules hard coded
 * The file give u back a string, u do with it as u please
 * 
 * @author itay
 * @date 20240328
 */
class JsonToPHP{
    
    /**
     * The decoded json to convert to a tree;
     * 
     * @var \stdClass
     */
    private \stdClass $decodedJson;
    
    /**
     * Stores the generated php code until
     * it is printed
     * 
     * @var string
     */
    private string $phpCode = "<?php\n";
    
    /**
     * Group name as presumed from the 
     * treeMeta node
     * 
     * @var string
     */
    private string $groupName;
    
    /**
     * Each successful steps will lower this by 1.
     * once it is 0, the code is ready
     * This is a way to ensure not calling the API of this class in the wrong order
     * 
     * @var int
     */
    private int $stepsToFinish = 1;

    /**
     * @param string $json
     * @param string $file_header The part you want to add to the beginning of the file (like name space).
     * @throws \Exception
     */
    public function __construct(string $json,string $file_header=''){
        $this->decodedJson = json_decode($json);
        $this->phpCode    .= $file_header . "\n";
        
        if($this->decodedJson === null){
            \fatal('Failed decoding JSON');//TODO move to ZimmerLogger abstract when we upgrade Zimmer to v2
            \fatal($json);//TODO move to ZimmerLogger abstract when we upgrade Zimmer to v2
            throw new \Exception('Failed decoding input JSON');
        }
        $this->validateTree();//Throws an Exception if not valid
        $this->groupName = $this->decodedJson->treeMeta->treeName;
        
        //adds the description
        $this->addDescription();
        
    }
    
    /**
     * 
     */
    public function getPhpCode():string{
        if($this->stepsToFinish !== 0){
            throw new \Exception('Did you call convertJsonToPHP() before calling this method?');
        }
        return $this->phpCode;
    }
    
    /**
     * API entry point
     * Handling the Root node
     * 
     */
    public function convertJsonToPHP():void{
        $rootJSON = $this->decodedJson->root;
        $this->validateRule($rootJSON);
        $root_var_name = $this->addRuleToCode($rootJSON);
        $this->traverseJSON($rootJSON,$root_var_name);
        $this->phpCode .= "\n\nreturn {$root_var_name};\n";
        $this->stepsToFinish--;
    }
 
    /**
     * Traverse and translate
     * 
     * @param \stdClass $ParentJSON
     * @param \SmartGroups\Rules\aRule $ParentNode
     */
    private function traverseJSON(\stdClass $ParentJSON,string $parent_rule_var_name):void{
        
        /**
         * This is union
         */
        if(isset($ParentJSON->unionChilds)){
            
            foreach($ParentJSON->unionChilds as $UnionChildJSON){
                $this->validateRule($UnionChildJSON);
                $union_child_var_name = $this->addRuleToCode($UnionChildJSON,$parent_rule_var_name);
                $this->traverseJSON($UnionChildJSON, $union_child_var_name);
            }
        }
        
        /**
         * We have child branches
         */
        if($ParentJSON->branches){
            foreach($ParentJSON->branches as $BranchChildJSON){                
                $this->validateRule($BranchChildJSON);
                $branch_child_var_name = $this->addRuleToCode($BranchChildJSON,$parent_rule_var_name);
                $this->traverseJSON($BranchChildJSON, $branch_child_var_name);
            }
        }
    }

    /**
     * 
     * @param \stdClass $ruleNode
     * @param string $parent_rule_var_name
     * @return string current rule var name
     */
    private function addRuleToCode(\stdClass $ruleNode, string $parent_rule_var_name=''):string{
        
        //class name
        $class_name = '\\' . $ruleNode->ruleClass;
        
        //calc rule var name
        $rule_var_name = preg_replace("/[^a-zA-Z0-9]+/", '', $ruleNode->meta->ruleHumanName);
        if(is_numeric($rule_var_name[0])){
            $rule_var_name = "R{$rule_var_name}";
        }
        $rule_var_name = '$'. $rule_var_name;
        
        //params
        $params = '[';
        foreach($ruleNode->params as $k=>$v){
            if(is_array($v)){
                $params .= "'{$k}'=>['" . join("','",$v) . "'],";
            } else {
                $params .= "'{$k}'=>'{$v}',";
            }
        }
        $params .= ',]';
        $params = str_replace([',,','[,]'],['','[]'],$params);
        
        //force refresh
        $force_refresh = $ruleNode->forceRefresh?'true':'false';
        
        //instantiate the object
        $code = "\n{$rule_var_name} = new {$class_name}(\n\tparams:{$params},\n\tforce_refresh:{$force_refresh},\n\thuman_name:'{$ruleNode->meta->ruleHumanName}',\n\thuman_description:'{$ruleNode->meta->ruleHumanDescription}'\n);\n";
        
        //action with parent, TODO make it explicit. if we get 'none' but there is a parent, then this is a union.
        $code .= match($ruleNode->actionUpstream){
            \SmartGroups\Rules\aRule::BRANCH_SET_OPERATION__INTERSECT => "{$parent_rule_var_name}->intersect({$rule_var_name});\n",
            \SmartGroups\Rules\aRule::BRANCH_SET_OPERATION__SUBTRACT  => "{$parent_rule_var_name}->subtract({$rule_var_name});\n",
            \SmartGroups\Rules\aRule::BRANCH_SET_OPERATION__NONE      => $parent_rule_var_name ? "{$parent_rule_var_name}->union_include({$rule_var_name});\n" : ''
        };
        
        $this->phpCode .= $code;
        return $rule_var_name;
    }
    
    /**
     * Tree valid
     * @return never
     */
    private function validateTree():void{
        if(!isset($this->decodedJson->treeMeta)){
            throw new \Exception('Tree missing [treeMeta] node');
        }
        
        if(!isset($this->decodedJson->treeMeta->treeName)){
            throw new \Exception('Tree missing [treeMeta->treeName] node');
        }
        
        if(!isset($this->decodedJson->treeMeta->treeDescription)){
            throw new \Exception('Tree missing [treeMeta->treeDescription] node');
        }
        
        if(!isset($this->decodedJson->root)){
            throw new \Exception('Tree missing [root] node');
        }
    }
    
    /**
     * Makes sure the necessary entries exists
     * @param \stdClass $RuleJSON
     */
    private function validateRule(\stdClass $RuleJSON):void{
        if(!isset($RuleJSON->meta)){
            throw new \Exception('Rule missing [meta] node');
        }
        
        if(!isset($RuleJSON->meta->ruleHumanName)){
            throw new \Exception('Rule missing [meta->ruleHumanName] node');
        }
        
        $rule_name = $RuleJSON->meta->ruleHumanName;
        
        if(!isset($RuleJSON->ruleClass)){
            throw new \Exception("Rule [{$rule_name}] missing [ruleClass] value");
        }
        
        if(!isset($RuleJSON->meta->ruleHumanDescription)){
            throw new \Exception("Rule [{$rule_name}] missing [meta->ruleHumanDescription] value");
        }
        
        if(!isset($RuleJSON->forceRefresh)){
            throw new \Exception("Rule [{$rule_name}] missing [forceRefresh] value");
        }
        
        if(!isset($RuleJSON->params)){
            throw new \Exception("Rule [{$rule_name}] missing [params] array");
        }
        
        if(!isset($RuleJSON->actionUpstream)){
            throw new \Exception("Rule [{$rule_name}] missing [actionUpstream] value");
        }
        
        if(!isset($RuleJSON->branches)){
            throw new \Exception("Rule [{$rule_name}] missing [branches] array");
        }
        
        if(str_contains($RuleJSON->ruleClass,'Union') && !isset($RuleJSON->unionChilds)){
            throw new \Exception("Rule [{$rule_name}] missing [unionChilds] array");
        }
        
    }
    
    /**
     * see method name
     */
    private function addDescription():void{
        $lines = explode("\n",$this->decodedJson->treeMeta->treeDescription);
        $this->phpCode .= "/*****************************************************\n";
        foreach($lines as $line){
            $this->phpCode .= ' * ' . trim($line) . "\n"; 
        }
        $this->phpCode .= " *****************************************************/\n";
    }
}
</phpfile>

<phpfile path="SmartGroups/Rules/aRule.php">
<?php namespace SmartGroups\Rules;

/**
 * Abstract class for the education groups.
 * This class will handle all the utility/boilerplate code
 * to handle chaining and structural validity of the tree.
 *
 * This package also includes the loader class, check
 * bottom of file
 *
 * @author Itay Moav
 * @date 20240311 - further cleaning for v3.1
 */
abstract class aRule{

        /**
         * These values represnts the current branch relationship to the 
         * up branch rule (the rule THIS rule is a branch of)
         * 
         * @var string $BRANCH_ACTION__INTERSECT
         * @var string $BRANCH_ACTION__SUBTRACT
         * @var string $BRANCH_ACTION__NONE
         */
        const 
                BRANCH_SET_OPERATION__INTERSECT    = 'intersect',
                BRANCH_SET_OPERATION__SUBTRACT     = 'subtract',
                BRANCH_SET_OPERATION__NONE         = 'none' //for example, the root node in the tree, or a node inside a union
        ;
        
        /**
         * The action this rule will have with it's parent node.
         * It will remain NONE in the case of a union list or root node 
         * of the entire tree.
         * 
         * BRANCH_SET_OPERATION__INTERSECT to intersect with father
         * BRANCH_SET_OPERATION__SUBTRACT  to be subtracted from father
         * 
         * Reason we o like this is we start to calculate from the edge leafs of the tree building up

         * @var string
         */
        protected string $this_branch_SET_operation_with_parent_node = self::BRANCH_SET_OPERATION__NONE;
        
        /**
         * Used for debug and when exporting tree from memory into
         * permament storage.
         * Can be left empt, but not recomended.
         * This comed with a method that allows implementing special formating
         * 
         * @var string
         */
        protected string $humanName = '';
        
        /**
         * Same as above, for description, helpful when visualizing stuff
         * @var string
         */
        protected string $humanDescription = '';
        
        /**
         * key to the redis group where we store the ids for this rule
         * @var array<string>
         */
        protected array $my_data_key = [];
        
        /**
         * The group ids/definers. What ever other params the Loader might need
         * or the Rule to make decisions
         * @var array<mixed> $params
         */
        protected array $params = [];
        
        /**
         * 
         * @var bool
         */
        protected bool $this_branch_is_in_the_tree = false;
        
        /**
         * Ususally we will see one branch,
         * If there are are more than one (do not confuse with union)
         * It will calculate each branch separately, and then sum the the result of their action on
         * THIS rule.
         * 
         * @var array<aRule>
         */
        protected array $branches = [];
        
        /**
         * Flag to signal the Rule if it should call the loadData process
         * @var bool
         */
        protected bool $SET_members_loaded = false;
        
        /**
         * This var is used one time to validate the tree.
         * certain code paths are blocked until a pulse is
         * sent.
         * 
         * @var boolean
         */        
        protected bool $pulse_received = false;

        /**
         * Forces the deletion of the Rule's SET in redis a nd triggers a loadData process for this rule
         * @var boolean
         */
        protected bool $force_refresh = false;
        
        /**
         * 
         * @param array<mixed> $params
         * @param bool $force_refresh
         * @param string $human_name
         * @param string $human_description
         */
        public function __construct(array $params,bool $force_refresh=false,string $human_name='',string $human_description=''){
            $this->params = $params;
            $this->force_refresh = $force_refresh;
            $this->humanName = $human_name?:$this->humanName;
            $this->humanDescription = $human_description?:$this->humanDescription;
        }
        
        /**
         * Once this rule goes through the loadIds 
         * phase. It holds the Redis prekey for that into
         * @return array<string>
         */
        public function pre_key():array{
            return $this->my_data_key;
        }
        
        /**
         * Recursively goes through the entire tree and validate it
         * @throws \SmartGroups\Exception\InfinityLoop
         * @return aRule
         */
        public function pulseValidate():aRule{
            if($this->pulse_received){
                throw new \SmartGroups\Exception\InfinityLoop('I have already been to this rule object');
            }
            
            /**
             * For most people, having more than one branch does not make any sense.
             * So, in the dumb down version (TEMBLE_MOD true) we do som extra checks for
             * things that are not necessarilly errors, but are code smells
             */
            if(\SmartGroups\CONFIG::CFG()->TEMBLE_MOD && count($this->branches) > 1){
                throw new \SmartGroups\Exception\TembleMod('No more than one child-branch per rule is allowed!',
                                                           \SmartGroups\Exception\TembleMod::TEMBLE_ERROR__MULTIPLE_BRANCHES);
            }
            
            $this->pulse_received = true;
            foreach($this->branches as $branch){//recursion
                /** @var aRule $branch */
                $branch->pulseValidate();
            }
            return $this;
        }
        
        /**
         * Recursivly load into storage all ids who comply to this rule
         * 
         * @param array<int|string> $specific_SET_members_to_calc
         * @return aRule
         */
        final public function pulseLoadUsers(array $specific_SET_members_to_calc=[]):aRule{
            if(!$this->pulse_received){
                throw new \SmartGroups\Exception\TreeValidated('pulseLoadUsers: Tree was not validated.');
            }
            
            $this->my_data_key = $this->loadUsers($specific_SET_members_to_calc);
            $this->SET_members_loaded = true;
            
            foreach($this->branches as $branch){//recursion
                /** @var aRule $branch */
                $branch->pulseLoadUsers($specific_SET_members_to_calc);
            }
            return $this;
        }
        
        /**
         * Preforms the calculation on the current tree.
         * This goes bottoms up.
         *
         * @param array<string> $i_am_your_father_group_key  This is the key of the Rule upstream in the current branch.
         *                                                   Used for doing the calc between this rule and the Father rule
         * @return array<string> handle to the result
         */
        public function pulseCalculate(array $i_am_your_father_group_key = []):array{
            if(!$this->pulse_received){
                throw new \SmartGroups\Exception\TreeValidated('pulseCalculate: Tree was not validated.');
            }
            
            if(!$this->SET_members_loaded){
                throw new \SmartGroups\Exception\NoDataFound('Ids were not pulseLoaded');
            }
            
            // do the action on the group (inclusive/exclusive/union)
            // and get the new key
            $result_of_my_action_key = $this->do_SET_operation($i_am_your_father_group_key);//sending to childs
            
            //sum the branches results
            if($this->branches){
                $temp_keys = [];
                foreach($this->branches as $branch){//recursion
                    /** @var aRule $branch */
                    $temp_keys []= $branch->pulseCalculate($result_of_my_action_key);
                }
                
                //sum the temp keys and get a new key
                $tree_result_key =  \SmartGroups\Redis\RedisAPI::sum($temp_keys);
            } else {
                $tree_result_key = $result_of_my_action_key;
            }
            
            return $tree_result_key;
        }
        
        /**
         * Reconstruct the tree in a stdClass to be converted into JSON
         * that can be stored in a JSON storage (DY/S3/JSON field in relational/MongoDB etc)
         * 
         * @param \stdClass $JSON
         * @throws \SmartGroups\Exception\InfinityLoop
         */
        public function pulseToJSON(\stdClass $JSON):void{
            if(!$this->pulse_received){
                throw new \SmartGroups\Exception\TreeValidated('pulseLoadUsers: Tree was not validated.');
            }

            $JSON->meta = [
                'ruleHumanName' => $this->getHumanName(),
                'ruleHumanDescription' => $this->getHumanDescription()
            ];
            
            $JSON->ruleClass    = get_class($this);
            $JSON->forceRefresh = $this->force_refresh;
            $JSON->params = $this->params;
            $JSON->actionUpstream = $this->this_branch_SET_operation_with_parent_node;
            
            $JSON->branches = [];
            foreach($this->branches as $branch){//recursion
                /** @var aRule $branch */
                $JSONBranch = new \stdClass;
                $branch->pulseToJSON($JSONBranch);
                $JSON->branches[]=$JSONBranch;
            }
        }
        
        /**
         * @param array<string> $i_am_your_father_group_key
         * @return array<string> data key of the new redis obj
         */
        protected function do_SET_operation(array $i_am_your_father_group_key):array{
            //if I am a root, then I am the group, I use my key. No point in doing any action on myself, with myself.
            if($i_am_your_father_group_key === [] ||  $i_am_your_father_group_key == $this->my_data_key){
                return $this->my_data_key;
            }
            
            return match($this->this_branch_SET_operation_with_parent_node){
                self::BRANCH_SET_OPERATION__INTERSECT => \SmartGroups\Redis\RedisAPI::intersec($this->my_data_key, ' with ',$i_am_your_father_group_key),
                self::BRANCH_SET_OPERATION__SUBTRACT  => \SmartGroups\Redis\RedisAPI::subtract($this->my_data_key, ' from ',$i_am_your_father_group_key),
                self::BRANCH_SET_OPERATION__NONE      => $this->my_data_key,
                
                default => throw new \Exception('Unclear what action should happen')
            };
        }
        
        /**
         * Return the class name to load ids with
         * 
         * @return string
         */
        abstract protected function load_users_class():string;

        /**
         * Assumes a loader class in same file with naming convention "pop" + this last part
         * 
         * @param array<mixed> $specific_SET_members_to_calc
         * @return array<string>
         */
        protected function loadUsers(array $specific_SET_members_to_calc=[]):array{
            $class_name = $this->load_users_class();
            $params = $this->params;
            if($specific_SET_members_to_calc){
                $params['specific_SET_members_to_calc'] = $specific_SET_members_to_calc;
            }
            
            $ret = $class_name::loadData($params,$this->force_refresh);
            return $ret;
        }
        
        /**
         * Flag to prevent the same object appear in the rule tree in
         * more than one place.
         *
         * @param bool $included
         */
        public function was_included($included=false):bool{
            if($included){
                $this->this_branch_is_in_the_tree = true;
            }
            return $this->this_branch_is_in_the_tree;
        }

        /**
         * Returns wether this is to be intersected with the parent node
         * @return bool
         */
        public function is_intersected():bool{
            return $this->this_branch_SET_operation_with_parent_node === self::BRANCH_SET_OPERATION__INTERSECT;
        }
        
        /**
         * Tells this node what operation or action will happen with the uptree node
         * @param string $SET_operation
         * @return aRule
         */
        public function set_upstree_SET_operation(string $SET_operation):aRule{
            $this->this_branch_SET_operation_with_parent_node = match($SET_operation){
                self::BRANCH_SET_OPERATION__INTERSECT => self::BRANCH_SET_OPERATION__INTERSECT,
                self::BRANCH_SET_OPERATION__SUBTRACT  => self::BRANCH_SET_OPERATION__SUBTRACT,
                self::BRANCH_SET_OPERATION__NONE      => self::BRANCH_SET_OPERATION__NONE,
                default => new \UnexpectedValueException("Got bad operation type [{$SET_operation}]")
            };
            
            return $this;
        }
        
        /**
         * Adds a child as an inclusive branch head
         * @deprecated
         * @return aRule
         * @throws \SmartGroups\Exception\SuperPosition|\LogicException
         */
        public function minclude(aRule $Branch):aRule{
            $this->internal_SET_operation($Branch,self::BRANCH_SET_OPERATION__INTERSECT);
            return $this;
        }

        /**
         * Adds a branch as an EXCLUDING branch head
         * 
         * @deprecated
         * @param aRule $branch
         * @return aRule
         * @throws \SmartGroups\Exception\SuperPosition
         */
        public function exclude(aRule $branch):aRule{
            $this->internal_SET_operation($branch,self::BRANCH_SET_OPERATION__SUBTRACT);
            return $this;
        }

        /**
         * Adds a child as an INTERSECTED branch head
         * @return aRule
         * @throws \SmartGroups\Exception\SuperPosition|\LogicException
         */
        public function intersect(aRule $Branch):aRule{
            $this->internal_SET_operation($Branch,self::BRANCH_SET_OPERATION__INTERSECT);
            return $this;
        }
        
        /**
         * Adds a branch as an SUBTRACTED branch head
         *
         * @param aRule $branch
         * @return aRule
         * @throws \SmartGroups\Exception\SuperPosition
         */
        public function subtract(aRule $branch):aRule{
            $this->internal_SET_operation($branch,self::BRANCH_SET_OPERATION__SUBTRACT);
            return $this;
        }
        
        /**
         * Actually do the inclusion into the tree
         * 
         * @param aRule $branch
         * @param string $intersect_or_subtract
         */
        protected function internal_SET_operation(aRule $branch,string $intersect_or_subtract):void{
            if($branch->was_included()){
                throw new \SmartGroups\Exception\SuperPosition(get_class($branch));
            }
            $branch->was_included(true);
            $branch->set_upstree_SET_operation($intersect_or_subtract);
            $this->branches[]=$branch;
            
            //I put this test at the end, so user can override this behavior with a try catch
            if($this->pulse_received){
                throw new \LogicException('Tree was already validated. Do not add items after validation.');
            }
        }
        
        /**
         * allows to get the himan name + formatting, if wanted
         * @return string
         */
        public function getHumanName():string{
            return $this->humanName;
        }
        
        
        /**
         * allows to get the himan description + formatting, if wanted
         * @return string
         */
        public function getHumanDescription():string{
            return $this->humanDescription;
        }
}
</phpfile>

<phpfile path="SmartGroups/Rules/Union.php">
<?php namespace SmartGroups\Rules;

/**
 * This objects unions two or more rules and treats their results as
 * one group
 *
 * the difference between a union and a simple multiple childs tree.
 * Consider the following scenario:
 *
 * Simple
 * Main group has users : 1,2,3,4,5,6,7,8,9,10
 * Main has two inclusive childs a={1,2,3,100} b={7,8,9,10,11}
 * B has child c={9,10}
 * calc: send all to a, a returns {1,2,3}
 * send all to b, b sends {7,8,9,10} to c,
 * c returns {9,10} which is added to {1,2,3}
 * result: {1,2,3,9,10}
 *
 *
 * Using UNION:
 * Main group has users : 1,2,3,4,5,6,7,8,9,10
 * Main has two UNION inclusive childs a={1,2,3,100} b={7,8,9,10,11} (let's call it UNION-A)
 * UNION-a has child c={9,10,666}
 * calc: send all to UNION-A (UNION-a = {1,2,3,100,7,8,9,10,11} => {1,2,3,7,8,9,10}
 * send to c => result is: {9,10}
 *
 *
 * SEE tests/unit/Rules/CalcTest.php
 *
 *
 * @author Itay Moav
 */
class Union extends aRule{
    
    /**
     * NOTICE! Unions are always forced to be refreshed between calculations.
     *         Unless I figure out how to make a unique name to a union if this even makes sense (as a union of several other groups
     *         is, so far, specific to a single calculation).
     * @param string $human_name
     * @param string $human_description
     * @return Union
     */
    static public function construct(string $human_name='',string $human_description=''):Union{
            return new Union([],true,$human_name?:'Union',$human_description?:'Union');
    }

    /**
     * All the SETs we will combine into this rule
     * @var array<aRule>
     */
    private array $union_childs = [];

    /**
     * Recursively goes through the entire tree and validate it
     *
     * @throws \SmartGroups\Exception\InfinityLoop|\LogicException
     * @return aRule
     */
    public function pulseValidate():aRule{
        //A union with only one branch/child does not make any sense.
        //It is a waste of I/O and memory.
        //Also, a Union with no branch/child does not make sense either.
        $child_branchs_count = count($this->union_childs);
        if($child_branchs_count<2){//read comment above, this is not a magic number
            throw new \LogicException("A Union rule makes sense with only 2 or more child branchs. You have [{$child_branchs_count}]!");
        }
        
        //aRule validate
        foreach ($this->union_childs as $UnionChild) {
            $UnionChild->pulseValidate();
        }
        return parent::pulseValidate();
    }

    /**
     * Reconstruct the tree in a stdClass to be converted into JSON
     * that can be stored in a JSON storage (DY/S3/JSON field in relational/MongoDB etc)
     *
     * @param \stdClass $JSON
     * @throws \SmartGroups\Exception\InfinityLoop
     */
    public function pulseToJSON(\stdClass $JSON):void{
        parent::pulseToJSON($JSON);
        $JSON->unionChilds = [];
        foreach ($this->union_childs as $UnionChild) {
            /** @var aRule $UnionChild */
            $JSONUnionChild = new \stdClass;
            $UnionChild->pulseToJSON($JSONUnionChild);
            $JSON->unionChilds[]=$JSONUnionChild;
        }
    }
    
    /**
     * Preforms the calculation on the current tree.
     * This goes bottoms up.
     *
     * @param array<string> $i_am_your_father_group_key 
     *            -> the key to the group of the parent, I need to act (include/exclude the results of this
     *            object with the data in the father key
     * @return array<string> handle to the result
     */
    protected function do_SET_operation(array $i_am_your_father_group_key):array{
        $temp_keys = [];
        foreach ($this->union_childs as $UnionChild) {
            /** @var aRule $UnionChild */
            $temp_keys[] = $UnionChild->pulseCalculate();
        }

        // sum into a new group all the results in $temp_keys;
        $this->my_data_key = \SmartGroups\Redis\RedisAPI::sum($temp_keys);

        // now union_key becomes the key of the current group and I apply the orignal action with it on the parent
        return parent::do_SET_operation($i_am_your_father_group_key);
    }

    /**
     * @param array<mixed> $user_ids_to_calc
     *       if this is to calculate changes for a specific group of identifiers.
     *       make the union kids to load their users
     * {@inheritDoc}
     * @see \SmartGroups\Rules\aRule::loadUsers()
     */
    protected function loadUsers(array $user_ids_to_calc = []):array{
        foreach ($this->union_childs as $UnionChild) { // recursion
            /** @var aRule $UnionChild */
            $UnionChild->pulseLoadUsers($user_ids_to_calc);
        }
        $this->SET_members_loaded = true;
        return [];
    }
    
    /**
     * Adds a child as an inclusive branch head into the union
     * There is no exclusive branches, as unions inner childs are minitree roots.
     * Can't start
     * a tree with nether members
     *
     * @param array<aRule> ...$branches
     * @return aRule
     * @throws \SmartGroups\Exception\SuperPosition|\LogicException
     */
    public function union_include(aRule ...$branches):aRule{
        foreach($branches as $branch){
            $this->internal_union_include($branch);
        }
        return $this;
    }
    
    /**
     * Semi alias of union_include. Short cut to get an array of items in one call
     * @param array<aRule> ...$branches of aRule
     * @return aRule
     * @throws \SmartGroups\Exception\SuperPosition|\LogicException
     */
    public function union_includes(aRule ...$branches):aRule{
        foreach($branches as $branch){
            $this->internal_union_include($branch);
        }
        return $this;
    }

    /**
     * Actually do the UNION inclusion into the tree
     * 
     * @param aRule $Branch
     * @return aRule
     * @throws \SmartGroups\Exception\SuperPosition|\LogicException
     */
    protected function internal_union_include(aRule $Branch):aRule{
        if ($this->pulse_received) {
            throw new \LogicException('Tree was already validated. Do not add items after validation.');
        }

        if ($Branch->was_included()) {
            throw new \SmartGroups\Exception\SuperPosition(get_class($Branch));
        }

        $Branch->was_included(true);
        $Branch->set_upstree_SET_operation(self::BRANCH_SET_OPERATION__NONE);//it wont do shit. U sum all the unions into one here
        $this->union_childs[] = $Branch;
        return $this;
    }
    
    /**
     * 
     * {@inheritDoc}
     * @see \SmartGroups\Rules\aRule::load_users_class()
     */
    protected function load_users_class(): string{return '';}
}
</phpfile>


<phpfile path="SmartGroups/Rules/StaticSET.php">
<?php namespace SmartGroups\Rules;

/**
 * Adhoc... StaticSET sets, can be used to arbitrarily load ids
 * and for testing purposes
 *
 * The params will be item 1 -> key for Redis
 * item 2 -> array of ids
 *
 * @author Itay Moav
 */
class StaticSET extends aRule
{
    
    /**
     * 
     * @param array<int|string> $static_set_members  $ids allowing mixed type for flexibility
     * @param bool $force_refresh
     * @param string $human_name
     * @param string $human_description
     * @throws \SmartGroups\Exception\TembleMod
     * @return StaticSET
     */
    static public function construct(
        array $static_set_members, 
        bool $force_refresh=false,
        string $human_name='',
        string $human_description=''):StaticSET{
            
            //Static groups should be small.
            //Adhoc with queries, should be in an adhoc rule, which inclues a loader class
            if(\SmartGroups\CONFIG::CFG()->TEMBLE_MOD && 
                count($static_set_members)>\SmartGroups\CONFIG::CFG()->STATIC_MAX_MEMBERS){
                    $c = count($static_set_members);
                    throw new \SmartGroups\Exception\TembleMod("Static SET has [{$c}] which is more than the allowed number of members",\SmartGroups\Exception\TembleMod::TEMBLE_ERROR__GAZILLION_SET_MEMBERS);
            }
            
            $params = [
                \SmartGroups\CONFIG::PARAMS_LABELS__STATIC_SET_MEMBERS => $static_set_members
            ];
            return new StaticSET($params,$force_refresh,$human_name?:'StaticSET',$human_description?:'StaticSET');
    }

    /**
     * Here I also make the ids into a hash and use that as the ruleName
     * This makes this unique for the input list. I also ordering the list.
     * 
     * @param array<mixed> $params
     * @param bool $force_refresh
     * @param string $human_name
     * @param string $human_description
     */
    public function __construct(array $params,bool $force_refresh=false,string $human_name='',string $human_description='')
    {
        parent::__construct($params,$force_refresh,$human_name,$human_description);
        
        //Sort and hash set members
        sort($params[\SmartGroups\CONFIG::PARAMS_LABELS__STATIC_SET_MEMBERS]);
        $key = md5(join('',$params[\SmartGroups\CONFIG::PARAMS_LABELS__STATIC_SET_MEMBERS]));
        
        //This is the key for this rule
        $this->my_data_key = [
            'staticset' => $key
        ];
    }

    /**
     * 
     * @param array<string|int> $specific_SET_members_to_calc
     * @return array<string,string>
     */
    protected function loadUsers(array $specific_SET_members_to_calc=[]):array
    {
        $R = \SmartGroups\Redis\RedisAPI::factory_client($this->my_data_key);
        $R->del();

        // If we check only some ids...
        $ids = $this->params[\SmartGroups\CONFIG::PARAMS_LABELS__STATIC_SET_MEMBERS];
        if (count($specific_SET_members_to_calc)) {
            $ids = array_intersect($specific_SET_members_to_calc, $ids);
        }

        if (count($ids)) {
            $R->sadd_array($ids);
        } else {
            $R->sadd(0);
        }
        return $this->my_data_key;
    }

    /**
     * silence this
     * @return string
     */
    protected function load_users_class(): string{return '';}
}
</phpfile>

<phpfile path="SmartGroups/Exception/TembleMod.php">
<?php namespace SmartGroups\Exception;
/**
 * When Temble mod is on, you should throw this exception everywhere it fails
 * 
 * @author itay
 * @date 20240322
 */
class TembleMod extends \Exception{
    const TEMBLE_ERROR__MULTIPLE_BRANCHES = 1000,
          TEMBLE_ERROR__UNION_OF_ONE      = 2000,
          TEMBLE_ERROR__GAZILLION_SET_MEMBERS = 3000
    ;
}

</phpfile>

<phpfile path="SmartGroups/Exception/TreeValidated.php">
<?php namespace SmartGroups\Exception;
/**
 * Shoots when the tree was not properly validated
 * 
 * @author itay
 *
 */
class TreeValidated extends \Exception{}
</phpfile>

<phpfile path="SmartGroups/Exception/SuperPosition.php">
<?php namespace SmartGroups\Exception;
/**
 * Shoots when the object checked has two parents.
 * In a tree an object can have ONE parent and 0 to many childs.
 * 
 * @author itay
 *
 */
class SuperPosition extends \Exception{}
</phpfile>

<phpfile path="SmartGroups/Exception/NoDataFound.php">
<?php namespace SmartGroups\Exception;
/**
 * When no data is found 
 * @author jack
 *
 */
class NoDataFound extends \Exception{}
</phpfile>

<phpfile path="SmartGroups/Exception/InfinityLoop.php">
<?php namespace SmartGroups\Exception;
/**
 * In linked rules, if there is a circular reference (a=>b=>c=>a).
 * @author itay
 *
 */
class InfinityLoop extends \Exception{}
</phpfile>

